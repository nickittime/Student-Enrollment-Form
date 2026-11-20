const isLocalServer = window.location.protocol.startsWith("http");
const jpdbBaseURL = isLocalServer ? "" : "http://api.login2explore.com:5577";
const jpdbIRL = "/api/irl";
const jpdbIML = "/api/iml";
const dbName = "SCHOOL-DB";
const relName = "STUDENT-TABLE";
const connToken = "YOUR_JPDB_CONNECTION_TOKEN";

const rollNoEl = document.getElementById("rollNo");
const fullNameEl = document.getElementById("fullName");
const studentClassEl = document.getElementById("studentClass");
const birthDateEl = document.getElementById("birthDate");
const addressEl = document.getElementById("address");
const enrollmentDateEl = document.getElementById("enrollmentDate");

const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const resetBtn = document.getElementById("resetBtn");

let lastCheckedRollNo = "";
let isChecking = false;

function disableDataFields(state) {
    fullNameEl.disabled = state;
    studentClassEl.disabled = state;
    birthDateEl.disabled = state;
    addressEl.disabled = state;
    enrollmentDateEl.disabled = state;
}

function resetForm() {
    rollNoEl.value = "";
    fullNameEl.value = "";
    studentClassEl.value = "";
    birthDateEl.value = "";
    addressEl.value = "";
    enrollmentDateEl.value = "";

    rollNoEl.disabled = false;
    disableDataFields(true);

    saveBtn.disabled = true;
    updateBtn.disabled = true;
    resetBtn.disabled = true;

    lastCheckedRollNo = "";
    isChecking = false;
    localStorage.removeItem("recno");
    rollNoEl.focus();
}

async function executeJPDB(endpoint, payload) {
    const response = await fetch(jpdbBaseURL + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: JSON.stringify(payload)
    });
    const text = await response.text();
    return JSON.parse(text);
}

function fillData(resJsonObj) {
    const lvData = JSON.parse(resJsonObj.data);
    localStorage.setItem("recno", lvData.rec_no);
    const record = lvData.record;
    fullNameEl.value = record["Full-Name"] || "";
    studentClassEl.value = record["Class"] || "";
    birthDateEl.value = record["Birth-Date"] || "";
    addressEl.value = record["Address"] || "";
    enrollmentDateEl.value = record["Enrollment-Date"] || "";
}

async function getStudent() {
    const rollNo = rollNoEl.value.trim();
    if (rollNo === "") {
        resetForm();
        return;
    }
    if (isChecking || rollNo === lastCheckedRollNo) {
        return;
    }
    if (!connToken || connToken === "YOUR_JPDB_CONNECTION_TOKEN") {
        alert("Set your Login2Xplore Connection Token in js/index.js first.");
        return;
    }

    isChecking = true;
    lastCheckedRollNo = rollNo;

    try {
        const resJsonObj = await executeJPDB(jpdbIRL, {
            token: connToken,
            cmd: "GET_BY_KEY",
            dbName: dbName,
            rel: relName,
            jsonStr: { "Roll-No": rollNo }
        });

        if (resJsonObj.status === 400) {
            disableDataFields(false);
            saveBtn.disabled = false;
            updateBtn.disabled = true;
            resetBtn.disabled = false;
            fullNameEl.focus();
        } else if (resJsonObj.status === 200) {
            fillData(resJsonObj);
            rollNoEl.disabled = true;
            disableDataFields(false);
            saveBtn.disabled = true;
            updateBtn.disabled = false;
            resetBtn.disabled = false;
            fullNameEl.focus();
        } else {
            lastCheckedRollNo = "";
            alert(resJsonObj.message || "Error connecting to database.");
        }
    } catch (err) {
        lastCheckedRollNo = "";
        alert("Start the server using: python student-enrollment-jpdb/server.py");
    } finally {
        isChecking = false;
    }
}

function validateData() {
    const rollNo = rollNoEl.value.trim();
    const fullName = fullNameEl.value.trim();
    const studentClass = studentClassEl.value.trim();
    const birthDate = birthDateEl.value.trim();
    const address = addressEl.value.trim();
    const enrollmentDate = enrollmentDateEl.value.trim();

    if (rollNo === "") {
        alert("Roll No. is required.");
        rollNoEl.focus();
        return null;
    }
    if (fullName === "") {
        alert("Full Name is required.");
        fullNameEl.focus();
        return null;
    }
    if (studentClass === "") {
        alert("Class is required.");
        studentClassEl.focus();
        return null;
    }
    if (birthDate === "") {
        alert("Birth Date is required.");
        birthDateEl.focus();
        return null;
    }
    if (address === "") {
        alert("Address is required.");
        addressEl.focus();
        return null;
    }
    if (enrollmentDate === "") {
        alert("Enrollment Date is required.");
        enrollmentDateEl.focus();
        return null;
    }

    return {
        "Roll-No": rollNo,
        "Full-Name": fullName,
        "Class": studentClass,
        "Birth-Date": birthDate,
        "Address": address,
        "Enrollment-Date": enrollmentDate
    };
}

async function saveData() {
    const recordObj = validateData();
    if (!recordObj) {
        return;
    }

    try {
        const resJsonObj = await executeJPDB(jpdbIML, {
            token: connToken,
            cmd: "PUT",
            dbName: dbName,
            rel: relName,
            jsonStr: recordObj
        });

        if (resJsonObj.status === 200) {
            alert("Student record saved to SCHOOL-DB successfully.");
            resetForm();
        } else {
            alert(resJsonObj.message || "Failed to save record.");
        }
    } catch (err) {
        alert("Error while saving record.");
    }
}

async function updateData() {
    const recordObj = validateData();
    if (!recordObj) {
        return;
    }

    const recNo = localStorage.getItem("recno");
    try {
        const resJsonObj = await executeJPDB(jpdbIML, {
            token: connToken,
            cmd: "UPDATE",
            dbName: dbName,
            rel: relName,
            jsonStr: {
                [recNo]: recordObj
            }
        });

        if (resJsonObj.status === 200) {
            alert("Student record updated in SCHOOL-DB successfully.");
            resetForm();
        } else {
            alert(resJsonObj.message || "Failed to update record.");
        }
    } catch (err) {
        alert("Error while updating record.");
    }
}

rollNoEl.addEventListener("change", getStudent);
rollNoEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        getStudent();
    }
});

window.addEventListener("DOMContentLoaded", resetForm);
