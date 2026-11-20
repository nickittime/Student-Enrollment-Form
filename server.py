import json
import os
import ssl
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JPDB_URL = "https://api.login2explore.com:5577"


def forward_to_jpdb(path, body):
    ctx = ssl._create_unverified_context()
    opener = urllib.request.build_opener(
        urllib.request.ProxyHandler({}),
        urllib.request.HTTPSHandler(context=ctx)
    )
    req = urllib.request.Request(
        JPDB_URL + path,
        data=body,
        headers={
            "Content-Type": "text/plain",
            "User-Agent": "Mozilla/5.0"
        },
        method="POST"
    )
    try:
        with opener.open(req, timeout=20) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        return 200, json.dumps({
            "status": 503,
            "message": "JPDB connection error: " + repr(e)
        }).encode("utf-8")


class JPDBProxyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if self.path in ("/api/irl", "/api/iml"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            status, resp_body = forward_to_jpdb(self.path, body)
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), JPDBProxyHandler)
    print("Open http://127.0.0.1:8000 in your browser")
    server.serve_forever()