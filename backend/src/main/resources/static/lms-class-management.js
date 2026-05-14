const API_BASE = (window.localStorage.getItem("lmsApiBase") || "http://localhost:5001").replace(/\/$/, "");

const subjectForm = document.getElementById("subject-form");
const subjectIdInput = document.getElementById("subject-id");
const subjectNameInput = document.getElementById("subject-name");
const subjectResetButton = document.getElementById("subject-reset");
const subjectTableBody = document.getElementById("subject-table-body");
const subjectClassTableBody = document.getElementById("subject-class-table-body");
const subjectPagination = document.getElementById("subject-pagination");

const classForm = document.getElementById("class-form");
const classIdInput = document.getElementById("class-id");
const classNameInput = document.getElementById("class-name");
const classGradeInput = document.getElementById("class-grade");
const classYearInput = document.getElementById("class-year");
const classResetButton = document.getElementById("class-reset");
const classTableBody = document.getElementById("class-table-body");
const classGradeFilter = document.getElementById("class-grade-filter");
const sessionBadge = document.getElementById("session-badge");
const logoutButton = document.getElementById("logout-button");
const authWarning = document.getElementById("auth-warning");
const subjectFormCard = document.getElementById("subject-form-card");
const classFormCard = document.getElementById("class-form-card");
const studentsSection = document.getElementById("students");
const teachersSection = document.getElementById("teachers");
const feesSection = document.getElementById("fees");
const navLinks = Array.from(document.querySelectorAll(".lms-nav-link"));

let subjects = [];
let schoolClasses = [];
let subjectMenuListenerBound = false;
let subjectPage = 1;
const subjectsPerRow = 5;
const subjectRowsPerPage = 5;
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
        authWarning.textContent = "User access can manage classes and subjects, while the students, teachers, and fees areas remain informational.";
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

const studentsNavLink = document.querySelector('a.lms-nav-link[href="#students"]');
const teachersNavLink = document.querySelector('a.lms-nav-link[href="#teachers"]');
const feesNavLink = document.querySelector('a.lms-nav-link[href="#fees"]');

if (currentRole !== "admin") {
    if (studentsNavLink) {
        studentsNavLink.classList.add("hidden");
    }
    if (teachersNavLink) {
        teachersNavLink.classList.add("hidden");
    }
    if (feesNavLink) {
        feesNavLink.classList.add("hidden");
    }
}

const pageSections = {
    classes: document.getElementById("classes"),
    subjects: document.getElementById("subjects"),
    students: studentsSection,
    teachers: teachersSection,
    fees: feesSection
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
    const allowedPages = currentRole === "admin" ? ["classes", "subjects", "students", "teachers", "fees"] : ["classes", "subjects"];
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
}

function closeAllSubjectMenus() {
    document.querySelectorAll(".subject-actions-menu").forEach((menu) => {
        menu.classList.add("hidden");
        menu.style.top = "";
        menu.style.left = "";
        menu.style.visibility = "";
    });
}

function ensureSubjectMenuCloseHandler() {
    if (subjectMenuListenerBound) {
        return;
    }

    document.addEventListener("click", closeAllSubjectMenus);
    subjectMenuListenerBound = true;
}

function createSubjectCell(subject) {
    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm";

    const name = document.createElement("div");
    name.className = "text-xs font-semibold text-slate-800";
    name.textContent = subject.name;

    const actions = document.createElement("div");
    actions.className = "relative";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-600 transition hover:bg-slate-50";
    toggle.textContent = "...";
    toggle.setAttribute("aria-label", "Subject actions");
    toggle.disabled = !canManageSubjects;
    if (!canManageSubjects) {
        toggle.classList.add("opacity-50");
    }

    const menu = document.createElement("div");
    menu.className = "subject-actions-menu fixed z-50 w-28 rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-lg hidden";

    const editAction = document.createElement("button");
    editAction.type = "button";
    editAction.className = "w-full rounded-md px-2 py-1 text-left text-slate-700 hover:bg-slate-100";
    editAction.textContent = "Edit";
    editAction.disabled = !canManageSubjects;
    editAction.addEventListener("click", () => {
        subjectIdInput.value = String(subject.id);
        subjectNameInput.value = subject.name;
        closeAllSubjectMenus();
    });

    const deleteAction = document.createElement("button");
    deleteAction.type = "button";
    deleteAction.className = "w-full rounded-md px-2 py-1 text-left text-red-600 hover:bg-red-50";
    deleteAction.textContent = "Delete";
    deleteAction.disabled = !canManageSubjects;
    deleteAction.addEventListener("click", async () => {
        if (!window.confirm(`Delete subject "${subject.name}"?`)) {
            return;
        }
        try {
            await requestJson(`/api/admin/subjects/${subject.id}`, { method: "DELETE" });
            await refreshAll();
            window.alert("Subject deleted successfully!");
        } catch (error) {
            window.alert(`Failed to delete subject: ${error.message}`);
        }
        closeAllSubjectMenus();
    });

    menu.append(editAction, deleteAction);
    actions.append(toggle, menu);
    wrapper.append(name, actions);

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isHidden = menu.classList.contains("hidden");
        closeAllSubjectMenus();
        if (isHidden) {
            const toggleRect = toggle.getBoundingClientRect();
            menu.classList.remove("hidden");
            menu.style.visibility = "hidden";
            requestAnimationFrame(() => {
                const menuRect = menu.getBoundingClientRect();
                const top = Math.max(8, toggleRect.top - menuRect.height - 8);
                const left = Math.max(8, toggleRect.right - menuRect.width);
                menu.style.top = `${top}px`;
                menu.style.left = `${left}px`;
                menu.style.visibility = "visible";
            });
        }
    });

    return wrapper;
}

function renderSubjects() {
    if (!subjectTableBody) {
        return;
    }

    subjectTableBody.innerHTML = "";
    ensureSubjectMenuCloseHandler();

    if (subjects.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = "<td class=\"p-3 text-sm text-slate-500\" colspan=\"5\">No subjects created yet.</td>";
        subjectTableBody.appendChild(row);
        renderSubjectPagination(1);
        return;
    }

    const subjectsPerPage = subjectsPerRow * subjectRowsPerPage;
    const totalPages = Math.max(1, Math.ceil(subjects.length / subjectsPerPage));
    if (subjectPage > totalPages) {
        subjectPage = totalPages;
    }

    const startIndex = (subjectPage - 1) * subjectsPerPage;
    const pageSubjects = subjects.slice(startIndex, startIndex + subjectsPerPage);

    for (let i = 0; i < pageSubjects.length; i += subjectsPerRow) {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        const chunk = pageSubjects.slice(i, i + subjectsPerRow);

        chunk.forEach((subject) => {
            const cell = document.createElement("td");
            cell.className = "p-2 align-top overflow-visible";
            cell.appendChild(createSubjectCell(subject));
            row.appendChild(cell);
        });

        for (let j = chunk.length; j < subjectsPerRow; j += 1) {
            const emptyCell = document.createElement("td");
            emptyCell.className = "p-2";
            row.appendChild(emptyCell);
        }

        subjectTableBody.appendChild(row);
    }

    renderSubjectPagination(totalPages);
}

function renderSubjectPagination(totalPages) {
    if (!subjectPagination) {
        return;
    }

    subjectPagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50";
        if (page === subjectPage) {
            button.classList.add("bg-emerald-600", "text-white", "border-emerald-600");
        }
        button.textContent = String(page);
        button.addEventListener("click", () => {
            subjectPage = page;
            renderSubjects();
        });
        subjectPagination.appendChild(button);
    }
}

function renderSubjectPageClasses() {
    if (!subjectClassTableBody) {
        return;
    }

    subjectClassTableBody.innerHTML = "";

    if (schoolClasses.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = "<td class=\"p-3 text-sm text-slate-500\" colspan=\"3\">No classes created yet.</td>";
        subjectClassTableBody.appendChild(row);
        return;
    }

    schoolClasses.forEach((schoolClass) => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        row.innerHTML = `
            <td class="p-3">${schoolClass.className}</td>
            <td class="p-3">${schoolClass.grade}</td>
            <td class="p-3">${schoolClass.academicYear}</td>
        `;
        subjectClassTableBody.appendChild(row);
    });
}

function renderClasses() {
    classTableBody.innerHTML = "";
    const filterGrade = classGradeFilter ? classGradeFilter.value.trim() : "";
    const visibleClasses = filterGrade
        ? schoolClasses.filter((schoolClass) => String(schoolClass.grade).trim() === filterGrade)
        : schoolClasses;

    visibleClasses.forEach((schoolClass) => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        row.innerHTML = `
            <td class="p-2">${schoolClass.className}</td>
            <td class="p-2">${schoolClass.grade}</td>
            <td class="p-2">${schoolClass.academicYear}</td>
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
    renderSubjectPageClasses();
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
        subjectIds: []
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

if (classGradeFilter) {
    classGradeFilter.addEventListener("change", renderClasses);
}

refreshAll().catch((error) => {
    window.alert(`Failed to load data: ${error.message}`);
});
