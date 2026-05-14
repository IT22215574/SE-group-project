const studentForm = document.getElementById("student-form");
const resetButton = document.getElementById("reset-button");
const refreshButton = document.getElementById("refresh-button");
const studentTableBody = document.getElementById("student-table-body");
const toastElement = document.getElementById("toast");

const studentIdInput = document.getElementById("student-id");
const admissionNoInput = document.getElementById("admission-no");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const genderInput = document.getElementById("gender");
const dateOfBirthInput = document.getElementById("date-of-birth");
const gradeInput = document.getElementById("grade");
const classIdInput = document.getElementById("class-id");
const guardianNameInput = document.getElementById("guardian-name");
const guardianPhoneInput = document.getElementById("guardian-phone");
const guardianEmailInput = document.getElementById("guardian-email");
const addressInput = document.getElementById("address");
const enrollmentDateInput = document.getElementById("enrollment-date");
const statusInput = document.getElementById("status");
const notesInput = document.getElementById("notes");

const searchKeywordInput = document.getElementById("search-keyword");
const filterStatusInput = document.getElementById("filter-status");
const filterGradeInput = document.getElementById("filter-grade");

const statTotal = document.getElementById("stat-total");
const statActive = document.getElementById("stat-active");
const statInactive = document.getElementById("stat-inactive");
const statOther = document.getElementById("stat-other");

let students = [];
let schoolClasses = [];

function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.remove("opacity-0", "translate-y-3");
    toastElement.classList.add("opacity-100", "translate-y-0");
    window.setTimeout(() => {
        toastElement.classList.add("opacity-0", "translate-y-3");
        toastElement.classList.remove("opacity-100", "translate-y-0");
    }, 2600);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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
            message = errorBody.message || errorBody.error || message;
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

function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

function resetForm() {
    studentIdInput.value = "";
    studentForm.reset();
    enrollmentDateInput.value = todayIsoDate();
    statusInput.value = "ACTIVE";
    admissionNoInput.focus();
}

function validateForm(payload) {
    if (!payload.admissionNo || !payload.firstName || !payload.lastName || !payload.gender || !payload.grade || !payload.guardianName || !payload.guardianPhone || !payload.status) {
        return "Please complete all required fields";
    }

    if (payload.email && !payload.email.includes("@")) {
        return "Student email is invalid";
    }

    if (payload.guardianEmail && !payload.guardianEmail.includes("@")) {
        return "Guardian email is invalid";
    }

    if (payload.dateOfBirth && payload.dateOfBirth >= todayIsoDate()) {
        return "Date of birth must be a past date";
    }

    if (payload.enrollmentDate && payload.enrollmentDate > todayIsoDate()) {
        return "Enrollment date cannot be in the future";
    }

    return "";
}

function selectedClassName() {
    const option = classIdInput.options[classIdInput.selectedIndex];
    return option ? option.dataset.name || "" : "";
}

function buildPayload() {
    return {
        admissionNo: admissionNoInput.value.trim(),
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        gender: genderInput.value,
        dateOfBirth: dateOfBirthInput.value || null,
        grade: gradeInput.value.trim(),
        classId: classIdInput.value,
        className: selectedClassName(),
        guardianName: guardianNameInput.value.trim(),
        guardianPhone: guardianPhoneInput.value.trim(),
        guardianEmail: guardianEmailInput.value.trim(),
        address: addressInput.value.trim(),
        enrollmentDate: enrollmentDateInput.value || null,
        status: statusInput.value,
        notes: notesInput.value.trim()
    };
}

function renderClassOptions() {
    const currentValue = classIdInput.value;
    classIdInput.innerHTML = '<option value="">No class selected</option>';

    schoolClasses.forEach((schoolClass) => {
        const option = document.createElement("option");
        option.value = String(schoolClass.id);
        option.dataset.name = schoolClass.className || "";
        option.dataset.grade = schoolClass.grade || "";
        option.textContent = `${schoolClass.className} - Grade ${schoolClass.grade}`;
        classIdInput.appendChild(option);
    });

    classIdInput.value = currentValue;
}

function statusBadge(status) {
    const normalized = String(status || "").toUpperCase();
    const classMap = {
        ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        INACTIVE: "bg-amber-50 text-amber-700 ring-amber-200",
        TRANSFERRED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
        GRADUATED: "bg-purple-50 text-purple-700 ring-purple-200"
    };
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${classMap[normalized] || "bg-slate-50 text-slate-700 ring-slate-200"}">${escapeHtml(normalized || "UNKNOWN")}</span>`;
}

function renderStudents() {
    studentTableBody.innerHTML = "";

    if (students.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.className = "px-3 py-8 text-center text-slate-500";
        cell.textContent = "No student records found.";
        row.appendChild(cell);
        studentTableBody.appendChild(row);
        return;
    }

    students.forEach((student) => {
        const row = document.createElement("tr");
        row.className = "align-top";

        row.innerHTML = `
            <td class="px-3 py-4 font-semibold text-slate-900">${escapeHtml(student.admissionNo)}</td>
            <td class="px-3 py-4">
                <p class="font-semibold text-slate-950">${escapeHtml(student.fullName)}</p>
                <p class="text-xs text-slate-500">${escapeHtml(student.email || student.phone || "No contact added")}</p>
            </td>
            <td class="px-3 py-4 text-slate-700">
                <p class="font-medium">${escapeHtml(student.className || "No class")}</p>
                <p class="text-xs text-slate-500">Grade ${escapeHtml(student.grade || "-")}</p>
            </td>
            <td class="px-3 py-4 text-slate-700">
                <p class="font-medium">${escapeHtml(student.guardianName)}</p>
                <p class="text-xs text-slate-500">${escapeHtml(student.guardianPhone)}</p>
            </td>
            <td class="px-3 py-4">${statusBadge(student.status)}</td>
            <td class="px-3 py-4"></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "mr-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => loadStudentIntoForm(student));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteStudent(student));

        actionsCell.append(editButton, deleteButton);
        studentTableBody.appendChild(row);
    });
}

function loadStudentIntoForm(student) {
    studentIdInput.value = student.id || "";
    admissionNoInput.value = student.admissionNo || "";
    firstNameInput.value = student.firstName || "";
    lastNameInput.value = student.lastName || "";
    emailInput.value = student.email || "";
    phoneInput.value = student.phone || "";
    genderInput.value = student.gender || "";
    dateOfBirthInput.value = student.dateOfBirth || "";
    gradeInput.value = student.grade || "";
    classIdInput.value = student.classId || "";
    guardianNameInput.value = student.guardianName || "";
    guardianPhoneInput.value = student.guardianPhone || "";
    guardianEmailInput.value = student.guardianEmail || "";
    addressInput.value = student.address || "";
    enrollmentDateInput.value = student.enrollmentDate || todayIsoDate();
    statusInput.value = student.status || "ACTIVE";
    notesInput.value = student.notes || "";

    window.scrollTo({ top: studentForm.offsetTop - 20, behavior: "smooth" });
}

async function deleteStudent(student) {
    if (!window.confirm(`Delete student '${student.fullName}'?`)) {
        return;
    }

    try {
        await requestJson(`/api/admin/students/${student.id}`, { method: "DELETE" });
        await refreshAll();
        showToast("Student deleted successfully");
    } catch (error) {
        showToast(error.message);
    }
}

function buildSearchUrl() {
    const params = new URLSearchParams();
    if (searchKeywordInput.value.trim()) {
        params.set("keyword", searchKeywordInput.value.trim());
    }
    if (filterStatusInput.value) {
        params.set("status", filterStatusInput.value);
    }
    if (filterGradeInput.value.trim()) {
        params.set("grade", filterGradeInput.value.trim());
    }
    return `/api/admin/students${params.toString() ? `?${params.toString()}` : ""}`;
}

async function refreshStats() {
    const stats = await requestJson("/api/admin/students/stats");
    statTotal.textContent = stats.totalStudents;
    statActive.textContent = stats.activeStudents;
    statInactive.textContent = stats.inactiveStudents;
    statOther.textContent = Number(stats.transferredStudents || 0) + Number(stats.graduatedStudents || 0);
}

async function refreshAll() {
    const [classData, studentData] = await Promise.all([
        requestJson("/api/admin/classes"),
        requestJson(buildSearchUrl())
    ]);

    schoolClasses = classData;
    students = studentData;

    renderClassOptions();
    renderStudents();
    await refreshStats();
}

studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = buildPayload();
    const validationError = validateForm(payload);
    if (validationError) {
        showToast(validationError);
        return;
    }

    const id = studentIdInput.value.trim();
    try {
        if (id) {
            await requestJson(`/api/admin/students/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            showToast("Student updated successfully");
        } else {
            await requestJson("/api/admin/students", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            showToast("Student created successfully");
        }

        resetForm();
        await refreshAll();
    } catch (error) {
        showToast(error.message);
    }
});

classIdInput.addEventListener("change", () => {
    const selected = classIdInput.options[classIdInput.selectedIndex];
    if (selected && selected.dataset.grade) {
        gradeInput.value = selected.dataset.grade;
    }
});

[searchKeywordInput, filterStatusInput, filterGradeInput].forEach((input) => {
    input.addEventListener("input", () => {
        refreshAll().catch((error) => showToast(error.message));
    });
});

resetButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", () => refreshAll().then(() => showToast("Data refreshed")).catch((error) => showToast(error.message)));

resetForm();
refreshAll().catch((error) => showToast(error.message));
