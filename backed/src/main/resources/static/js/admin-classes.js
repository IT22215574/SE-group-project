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

const toastElement = document.getElementById("toast");

let subjects = [];
let schoolClasses = [];

function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("show");
    window.setTimeout(() => {
        toastElement.classList.remove("show");
    }, 2200);
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let message = "Request failed";
        try {
            const errorBody = await response.json();
            message = errorBody.message || message;
        } catch (_error) {
            message = response.statusText || message;
        }
        throw new Error(message);
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

    if (subjects.length === 0) {
        const info = document.createElement("p");
        info.textContent = "No subjects available. Create one first.";
        subjectCheckboxes.appendChild(info);
        return;
    }

    subjects.forEach((subject) => {
        const chip = document.createElement("span");
        chip.className = "chip";

        const name = document.createElement("span");
        name.textContent = subject.name;

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            subjectIdInput.value = String(subject.id);
            subjectNameInput.value = subject.name;
            subjectNameInput.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(`Delete subject '${subject.name}'?`)) {
                return;
            }
            try {
                await requestJson(`/api/admin/subjects/${subject.id}`, { method: "DELETE" });
                await refreshAll();
                showToast("Subject deleted");
            } catch (error) {
                showToast(error.message);
            }
        });

        chip.append(name, editButton, deleteButton);
        subjectList.appendChild(chip);

        const wrapper = document.createElement("label");
        wrapper.className = "checkbox-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "subject-checkbox";
        checkbox.value = String(subject.id);

        const text = document.createElement("span");
        text.textContent = subject.name;

        wrapper.append(checkbox, text);
        subjectCheckboxes.appendChild(wrapper);
    });
}

function renderClasses() {
    classTableBody.innerHTML = "";

    if (schoolClasses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No classes found. Create your first class.";
        row.appendChild(cell);
        classTableBody.appendChild(row);
        return;
    }

    schoolClasses.forEach((schoolClass) => {
        const row = document.createElement("tr");

        const subjectsHtml = schoolClass.subjects.length
            ? schoolClass.subjects.map((subject) => `<span class="badge">${subject.name}</span>`).join("")
            : "<span class=\"badge\">No subjects</span>";

        row.innerHTML = `
            <td>${schoolClass.className}</td>
            <td>${schoolClass.grade}</td>
            <td>${schoolClass.academicYear}</td>
            <td>${subjectsHtml}</td>
            <td></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-ghost";
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

            window.scrollTo({ top: classForm.offsetTop - 20, behavior: "smooth" });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(`Delete class '${schoolClass.className}'?`)) {
                return;
            }
            try {
                await requestJson(`/api/admin/classes/${schoolClass.id}`, { method: "DELETE" });
                await refreshAll();
                showToast("Class deleted");
            } catch (error) {
                showToast(error.message);
            }
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

    if (!payload.name) {
        showToast("Subject name is required");
        return;
    }

    try {
        if (id) {
            await requestJson(`/api/admin/subjects/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            showToast("Subject updated");
        } else {
            await requestJson("/api/admin/subjects", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            showToast("Subject created");
        }

        resetSubjectForm();
        await refreshAll();
    } catch (error) {
        showToast(error.message);
    }
});

classForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = classIdInput.value.trim();
    const selectedSubjectIds = Array.from(document.querySelectorAll(".subject-checkbox:checked"))
        .map((checkbox) => Number(checkbox.value));

    const payload = {
        className: classNameInput.value.trim(),
        grade: classGradeInput.value.trim(),
        academicYear: classYearInput.value.trim(),
        subjectIds: selectedSubjectIds
    };

    if (!payload.className || !payload.grade || !payload.academicYear) {
        showToast("Please complete all class fields");
        return;
    }

    try {
        if (id) {
            await requestJson(`/api/admin/classes/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            showToast("Class updated");
        } else {
            await requestJson("/api/admin/classes", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            showToast("Class created");
        }

        resetClassForm();
        await refreshAll();
    } catch (error) {
        showToast(error.message);
    }
});

subjectResetButton.addEventListener("click", resetSubjectForm);
classResetButton.addEventListener("click", resetClassForm);

refreshAll().catch((error) => {
    showToast(error.message);
});
