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
const sessionBadge = document.getElementById("session-badge");
const logoutButton = document.getElementById("logout-button");
const authWarning = document.getElementById("auth-warning");
const subjectFormCard = document.getElementById("subject-form-card");
const classFormCard = document.getElementById("class-form-card");
const usersSection = document.getElementById("users");
const feesSection = document.getElementById("fees");
const navLinks = Array.from(document.querySelectorAll(".lms-nav-link"));

let subjects = [];
let schoolClasses = [];
const currentAuth = typeof requireAuth === "function" ? requireAuth() : null;

if (!currentAuth) {
    window.location.href = "./login.html";
}

function setActiveNavLinkFromHash() {
    if (!navLinks.length) {
        return;
    }

    const available = new Set(navLinks.map((link) => link.getAttribute("href")));
    const hash = window.location.hash && available.has(window.location.hash) ? window.location.hash : null;

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isActive = Boolean(hash) && href === hash;
        link.classList.toggle("text-blue-600", isActive);
        link.classList.toggle("text-slate-900", !isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        setTimeout(setActiveNavLinkFromHash, 0);
    });
});

window.addEventListener("hashchange", setActiveNavLinkFromHash);
setActiveNavLinkFromHash();

const currentRole = currentAuth ? currentAuth.role : "visitor";
const canManageSubjects = typeof roleCanManageSubjects === "function" ? roleCanManageSubjects(currentRole) : false;
const canManageClasses = typeof roleCanManageClasses === "function" ? roleCanManageClasses(currentRole) : false;

if (sessionBadge && currentAuth) {
    sessionBadge.textContent = `${roleLabel(currentRole)}: ${currentAuth.email}`;
}

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (!confirmed) {
            return;
        }
        if (typeof clearAuthState === "function") {
            clearAuthState();
        }
        window.location.href = "./login.html";
    });
}

if (authWarning) {
    if (currentRole === "student") {
        authWarning.textContent = "Student access is read-only. You can view classes and subjects, but you cannot create, edit, or delete records.";
        authWarning.classList.remove("hidden");
    } else if (currentRole === "teacher") {
        authWarning.textContent = "User access can manage classes and subjects, while the users and exams areas remain informational.";
        authWarning.classList.remove("hidden");
    }
}

if (subjectFormCard && !canManageSubjects) {
    subjectFormCard.querySelectorAll("input, button").forEach((element) => {
        if (element.id !== "subject-reset") {
            element.disabled = true;
        }
    });
    subjectFormCard.classList.add("opacity-75");
}

if (classFormCard && !canManageClasses) {
    classFormCard.querySelectorAll("input, button").forEach((element) => {
        if (element.id !== "class-reset") {
            element.disabled = true;
        }
    });
    classFormCard.classList.add("opacity-75");
}

const usersNavLink = document.querySelector('a.lms-nav-link[href="#users"]');
const feesNavLink = document.querySelector('a.lms-nav-link[href="#fees"]');

if (currentRole !== "admin") {
    if (usersNavLink) {
        usersNavLink.classList.add("hidden");
    }
    if (feesNavLink) {
        feesNavLink.classList.add("hidden");
    }
}

const pageSections = {
    classes: document.getElementById("classes"),
    subjects: document.getElementById("subjects"),
    users: usersSection,
    fees: feesSection,
    attendance: document.getElementById("attendance"),
    students: document.getElementById("students")
};

function pageFromHash() {
    const hash = window.location.hash || "";
    return hash.startsWith("#") ? hash.slice(1) : hash;
}

function showOnlyPage(page) {
    Object.values(pageSections).forEach((section) => {
        if (section) {
            section.classList.add("hidden");
        }
    });

    const target = pageSections[page];
    if (target) {
        target.classList.remove("hidden");
    }
}

function syncPageFromHash() {
    const allowedPages = currentRole === "admin" 
        ? ["classes", "subjects", "users", "fees", "attendance", "students"] 
        : ["classes", "subjects", "attendance", "students"];
    const page = pageFromHash();

    if (!page) {
        window.location.hash = "#classes";
        return;
    }

    if (!allowedPages.includes(page)) {
        window.location.hash = "#classes";
        return;
    }

    showOnlyPage(page);
}

window.addEventListener("hashchange", syncPageFromHash);
syncPageFromHash();

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
        chip.disabled = !canManageSubjects;
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
        editButton.disabled = !canManageClasses;
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
        deleteButton.disabled = !canManageClasses;
        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(`Are you sure you want to delete class "${schoolClass.className}"?`)) {
                return;
            }
            try {
                await requestJson(`/api/admin/classes/${schoolClass.id}`, { method: "DELETE" });
                await refreshAll();
                window.alert("Class deleted successfully!");
            } catch (error) {
                window.alert(`Failed to delete class: ${error.message}`);
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
    if (!canManageSubjects) {
        return;
    }

    const id = subjectIdInput.value.trim();
    const name = subjectNameInput.value.trim();

    if (!name) {
        window.alert("Subject name cannot be empty.");
        return;
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
        window.alert("Subject name can only contain letters.");
        return;
    }

    const payload = { name };

    try {
        if (id) {
            await requestJson(`/api/admin/subjects/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Subject updated successfully!");
        } else {
            await requestJson("/api/admin/subjects", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("Subject created successfully!");
        }

        resetSubjectForm();
        await refreshAll();
    } catch (error) {
        window.alert(`Failed to save subject: ${error.message}`);
    }
});

classForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canManageClasses) {
        return;
    }

    const id = classIdInput.value.trim();
    const className = classNameInput.value.trim();
    const grade = classGradeInput.value.trim();
    const academicYear = classYearInput.value.trim();

    if (!className || !grade || !academicYear) {
        window.alert("All fields are required.");
        return;
    }

    if (!/^\d+$/.test(grade)) {
        window.alert("Grade must be a number.");
        return;
    }

    if (parseInt(grade, 10) > 13) {
        window.alert("Grade cannot be greater than 13.");
        return;
    }

    if (!/^\d+$/.test(academicYear)) {
        window.alert("Academic Year must be a number.");
        return;
    }

    const payload = {
        className,
        grade,
        academicYear,
        subjectIds: Array.from(document.querySelectorAll(".subject-checkbox:checked")).map((checkbox) => checkbox.value)
    };

    try {
        if (id) {
            await requestJson(`/api/admin/classes/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Class updated successfully!");
        } else {
            await requestJson("/api/admin/classes", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("Class created successfully!");
        }

        resetClassForm();
        await refreshAll();
    } catch (error) {
        window.alert(`Failed to save class: ${error.message}`);
    }
});

subjectResetButton.addEventListener("click", resetSubjectForm);
classResetButton.addEventListener("click", resetClassForm);

refreshAll().catch((error) => {
    window.alert(`Failed to load data: ${error.message}`);
});
