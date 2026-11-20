# Student Enrollment Form — Login2Xplore JsonPowerDB

A responsive web-based **Student Enrollment Form** built with HTML5, Bootstrap 5, Vanilla JavaScript, and **Login2Xplore JsonPowerDB (JPDB)**. The application performs real-time primary-key lookups, enforces form-state locking and validation, and persists student records directly to a JsonPowerDB cloud relation.

---

## Database & Relation Schema

| Property | Value |
| :--- | :--- |
| **Database Name** | `SCHOOL-DB` |
| **Relation (Table) Name** | `STUDENT-TABLE` |
| **Primary Key** | `Roll-No` |
| **Input Fields** | `Roll-No`, `Full-Name`, `Class`, `Birth-Date`, `Address`, `Enrollment-Date` |

---

## Key Features & Form Workflow

* **Initial State:** On page load or reset, only the **Roll No.** (primary key) input field is enabled with active cursor focus; all other input fields and `[Save]`, `[Update]`, and `[Reset]` buttons remain disabled.
* **New Record Entry (`PUT`):** Entering a `Roll-No` that does not exist in `STUDENT-TABLE` unlocks the remaining fields, enables `[Save]` and `[Reset]`, and moves focus to **Full Name**.
* **Existing Record Retrieval & Edit (`GET_BY_KEY` & `UPDATE`):** Entering an existing `Roll-No` fetches and populates the stored record, keeps `Roll-No` locked, enables `[Update]` and `[Reset]`, and allows editing the remaining fields.
* **Field Validation:** Prevents empty submissions across all required fields before executing database write operations.
* **Form Reset:** Clicking `[Reset]` at any point clears all inputs and restores the form to its initial locked state.
* **Built-in Local Proxy (`server.py`):** Serves static assets over HTTP (`127.0.0.1:8000`) and forwards `/api/irl` and `/api/iml` requests to `https://api.login2explore.com:5577` cleanly without browser CORS issues.

---

## Project Structure

```text
student-enrollment-jpdb/
├── index.html          # Student Enrollment Form UI (Bootstrap 5)
├── server.py           # Local HTTP server & HTTPS proxy for JsonPowerDB API
├── css/
│   └── style.css       # Custom form styling and disabled-state rules
├── js/
│   └── index.js        # Form state machine, validation, and JPDB API integration
└── README.md           # Project documentation
```

---

## Setup & How to Run

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
   cd YOUR_REPO_NAME
   ```

2. **Add your Login2Xplore Connection Token:**
   Open `js/index.js` and replace the placeholder value in `connToken` with your active token from the Login2Xplore dashboard:
   ```javascript
   const connToken = "YOUR_JPDB_CONNECTION_TOKEN";
   ```

3. **Start the local server:**
   ```bash
   python server.py
   ```

4. **Open in your browser:**
   Navigate to `http://127.0.0.1:8000` and enter a `Roll No.` to begin adding or updating records. You can inspect stored records in the **Visualize** section of your Login2Xplore portal under `SCHOOL-DB` → `STUDENT-TABLE`.

---

## Tech Stack

* **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (ES6+ Fetch API)
* **Backend / Proxy:** Python 3 (`http.server`, `urllib.request`)
* **Database:** Login2Xplore JsonPowerDB (JPDB)
