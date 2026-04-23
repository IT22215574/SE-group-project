const API_BASE = (window.localStorage.getItem("lmsApiBase") || "http://localhost:5001").replace(/\/$/, "");

const subjectForm = document.getElementById("subject-form");
const subjectIdInput = document.getElementById("subject-id");
const subjectNameInput = document.getElementById("subject-name");
const subjectResetButton = document.getElementById("subject-reset");
const subjectList = document.getElementById("subject-list");

const classForm = document.getElementById("class-form");
const classIdInput = document.getElementById("class-id");
const classNameInput = document.getElementById("class-name");
const classGradeInput = document.getElementById("class-grade");
const classYearInput = document.getElementById("class-year");
const classResetButton = document.getElementById("class-reset");
const subjectCheckboxes = document.getElementById("subject-checkboxes");
const classTableBody = document.getElementById("class-table-body");

let subjects = [];
let schoolClasses = [];

async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function resetSubjectForm() {
    subjectIdInput.value = "";
    subjectNameInput.value = "";
}

function resetClassForm() {
    classIdInput.value = "";
    classNameInput.value = "";
    classGradeInput.value = "";
    classYearInput.value = "";
    document.querySelectorAll(".subject-checkbox").forEach((checkbox) => {
        checkbox.checked = false;
    });
}

function renderSubjects() {
    subjectList.innerHTML = "";
    subjectCheckboxes.innerHTML = "";

    subjects.forEach((subject) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "rounded-full border border-slate-300 px-3 py-1 text-xs";
        chip.textContent = `Edit ${subject.name}`;
        chip.addEventListener("click", () => {
            subjectIdInput.value = String(subject.id);
            subjectNameInput.value = subject.name;
        });
        subjectList.appendChild(chip);

        const label = document.createElement("label");
        label.className = "flex items-center gap-2 rounded-lg border border-slate-300 p-2";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "subject-checkbox";
        checkbox.value = String(subject.id);

        const text = document.createElement("span");
        text.textContent = subject.name;

        label.append(checkbox, text);
        subjectCheckboxes.appendChild(label);
    });
}

function renderClasses() {
    classTableBody.innerHTML = "";

    schoolClasses.forEach((schoolClass) => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        row.innerHTML = `
            <td class="p-2">${schoolClass.className}</td>
            <td class="p-2">${schoolClass.grade}</td>
            <td class="p-2">${schoolClass.academicYear}</td>
            <td class="p-2">${schoolClass.subjects.map((subject) => subject.name).join(", ")}</td>
            <td class="p-2"></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            classIdInput.value = String(schoolClass.id);
            classNameInput.value = schoolClass.className;
            classGradeInput.value = schoolClass.grade;
            classYearInput.value = schoolClass.academicYear;

            const selected = new Set(schoolClass.subjects.map((subject) => String(subject.id)));
            document.querySelectorAll(".subject-checkbox").forEach((checkbox) => {
                checkbox.checked = selected.has(checkbox.value);
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "rounded-lg bg-red-600 px-3 py-1 text-xs text-white";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
            await requestJson(`/api/admin/classes/${schoolClass.id}`, { method: "DELETE" });
            await refreshAll();
        });

        actionsCell.append(editButton, deleteButton);
        classTableBody.appendChild(row);
    });
}

async function refreshAll() {
    const [subjectData, classData] = await Promise.all([
        requestJson("/api/admin/subjects"),
        requestJson("/api/admin/classes")
    ]);

    subjects = subjectData;
    schoolClasses = classData;

    renderSubjects();
    renderClasses();
}

subjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = subjectIdInput.value.trim();
    const payload = { name: subjectNameInput.value.trim() };

    if (id) {
        await requestJson(`/api/admin/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    } else {
        await requestJson("/api/admin/subjects", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    resetSubjectForm();
    await refreshAll();
});

classForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = classIdInput.value.trim();
    const payload = {
        className: classNameInput.value.trim(),
        grade: classGradeInput.value.trim(),
        academicYear: classYearInput.value.trim(),
        subjectIds: Array.from(document.querySelectorAll(".subject-checkbox:checked")).map((checkbox) => Number(checkbox.value))
    };

    if (id) {
        await requestJson(`/api/admin/classes/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    } else {
        await requestJson("/api/admin/classes", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    resetClassForm();
    await refreshAll();
});

subjectResetButton.addEventListener("click", resetSubjectForm);
classResetButton.addEventListener("click", resetClassForm);

refreshAll().catch((error) => {
    window.alert(`Failed to load data: ${error.message}`);
});
