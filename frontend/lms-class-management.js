const API_BASE = (
  window.localStorage.getItem("lmsApiBase") || "http://localhost:5001"
).replace(/\/$/, "");

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
const classNotesInput = document.getElementById("class-notes");
const classResetButton = document.getElementById("class-reset");
const classSuffixInput = document.getElementById("class-suffix");
const classNamePrefix = document.getElementById("class-name-prefix");
const classNamePreview = document.getElementById("class-name-preview");
const classTableBody = document.getElementById("class-table-body");
const classGradeFilter = document.getElementById("class-grade-filter");
const sessionBadge = document.getElementById("session-badge");
const logoutButton = document.getElementById("logout-button");
const authWarning = document.getElementById("auth-warning");
const subjectFormCard = document.getElementById("subject-form-card");
const classFormCard = document.getElementById("class-form-card");
const subjectAssignmentModal = document.getElementById("subject-assignment-modal");
const subjectAssignmentForm = document.getElementById("subject-assignment-form");
const assignmentClassSelect = document.getElementById("assignment-class-select");
const assignmentSubjectList = document.getElementById("assignment-subject-list");
const assignmentResetButton = document.getElementById("assignment-reset");
const assignmentCloseButton = document.getElementById("assignment-close");
const usersSection = document.getElementById("users");
const attendanceSection = document.getElementById("attendance");
const teachersSection = document.getElementById("teachers");
const feesSection = document.getElementById("fees");
const resultsSection = document.getElementById("results");
const notificationsSection = document.getElementById("notifications");
const examsSection = document.getElementById("exams");
const navLinks = Array.from(document.querySelectorAll(".lms-nav-link"));
const teacherForm = document.getElementById("teacher-form");
const teacherFormCard = document.getElementById("teacher-form-card");
const teacherIdInput = document.getElementById("teacher-id");
const teacherCodeInput = document.getElementById("teacher-code");
const teacherFirstNameInput = document.getElementById("teacher-first-name");
const teacherLastNameInput = document.getElementById("teacher-last-name");
const teacherEmailInput = document.getElementById("teacher-email");
const teacherPhoneInput = document.getElementById("teacher-phone");
const teacherGenderInput = document.getElementById("teacher-gender");
const teacherSubjectInput = document.getElementById("teacher-subject");
const teacherClassInput = document.getElementById("teacher-class");
const teacherQualificationInput = document.getElementById("teacher-qualification");
const teacherStatusInput = document.getElementById("teacher-status");
const teacherResetButton = document.getElementById("teacher-reset");
const teacherRefreshButton = document.getElementById("teacher-refresh");
const teacherSearchInput = document.getElementById("teacher-search");
const teacherFilterSubjectInput = document.getElementById("teacher-filter-subject");
const teacherFilterClassInput = document.getElementById("teacher-filter-class");
const teacherFilterStatusInput = document.getElementById("teacher-filter-status");
const teacherTableBody = document.getElementById("teacher-table-body");
const teacherStatTotal = document.getElementById("teacher-stat-total");
const teacherStatActive = document.getElementById("teacher-stat-active");
const teacherStatInactive = document.getElementById("teacher-stat-inactive");
const teacherStatOnLeave = document.getElementById("teacher-stat-on-leave");

let subjects = [];
let schoolClasses = [];
let teachers = [];
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
  const hash =
    window.location.hash && available.has(window.location.hash)
      ? window.location.hash
      : null;

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
const canManageSubjects =
  typeof roleCanManageSubjects === "function"
    ? roleCanManageSubjects(currentRole)
    : false;
const canManageClasses =
  typeof roleCanManageClasses === "function"
    ? roleCanManageClasses(currentRole)
    : false;
const canManageTeachers = currentRole === "admin";

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
        authWarning.textContent = "User access can manage classes and subjects, while the users, fees, and exams areas remain informational.";
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

if (teacherFormCard && !canManageTeachers) {
    teacherFormCard.querySelectorAll("input, select, button").forEach((element) => {
        if (element.id !== "teacher-reset") {
            element.disabled = true;
        }
    });
    teacherFormCard.classList.add("opacity-75");
}

if (subjectAssignmentModal && !canManageClasses) {
    subjectAssignmentModal.querySelectorAll("input, select, button").forEach((element) => {
        if (element.id !== "assignment-reset") {
            element.disabled = true;
        }
    });
    subjectAssignmentModal.classList.add("opacity-75");
}

const usersNavLink = document.querySelector('a.lms-nav-link[href="#users"]');
const attendanceNavLink = document.querySelector('a.lms-nav-link[href="#attendance"]');
const teachersNavLink = document.querySelector('a.lms-nav-link[href="#teachers"]');
const feesNavLink = document.querySelector('a.lms-nav-link[href="#fees"]');
const examsNavLink = document.querySelector('a.lms-nav-link[href="#exams"]');

if (currentRole !== "admin") {
    if (usersNavLink) usersNavLink.classList.add("hidden");
    if (attendanceNavLink) attendanceNavLink.classList.add("hidden");
    if (teachersNavLink) teachersNavLink.classList.add("hidden");
    if (feesNavLink) feesNavLink.classList.add("hidden");
    if (examsNavLink) examsNavLink.classList.add("hidden");
}

const pageSections = {
    classes: document.getElementById("classes"),
    subjects: document.getElementById("subjects"),
    users: usersSection,
    attendance: attendanceSection,
    teachers: teachersSection,
    fees: feesSection,
    results: resultsSection,
    exams: examsSection,
    notifications: notificationsSection
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

  if (page === "teachers") {
    loadTeachers().catch((error) => {
      window.alert(`Failed to load teachers: ${error.message}`);
    });
  }
}

function syncPageFromHash() {
    // non-admin: can see classes, subjects, results, notifications
    // admin: can see everything including users, attendance, teachers, fees, exams
    let allowedPages = ["classes", "subjects", "results", "notifications"];
    if (currentRole === "admin") {
        allowedPages = ["classes", "subjects", "users", "attendance", "teachers", "fees", "results", "exams", "notifications"];
    }
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
      ...(options.headers || {}),
    },
    ...options,
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
    if (classNotesInput) classNotesInput.value = "";
    if (classSuffixInput) classSuffixInput.value = "";
    if (classNamePrefix) classNamePrefix.textContent = "Grade __ - ";
    if (classNamePreview) classNamePreview.textContent = "";
}

function updateClassName() {
    const grade = classGradeInput.value.trim();
    const suffix = classSuffixInput ? classSuffixInput.value.toUpperCase() : "";
    if (classNamePrefix) {
        classNamePrefix.textContent = grade ? `Grade ${grade} - ` : "Grade __ - ";
    }
    const full = grade && suffix ? `Grade ${grade} - ${suffix}` : "";
    classNameInput.value = full;
    if (classNamePreview) {
        classNamePreview.textContent = full ? `Preview: ${full}` : "";
    }
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
    wrapper.className = "flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm w-full min-w-0";

    const name = document.createElement("div");
    name.className = "text-xs font-semibold text-slate-800 truncate min-w-0";
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
            cell.className = "p-3 align-top overflow-visible w-1/5";
            cell.appendChild(createSubjectCell(subject));
            row.appendChild(cell);
        });

        for (let j = chunk.length; j < subjectsPerRow; j += 1) {
            const emptyCell = document.createElement("td");
            emptyCell.className = "p-2 w-1/5";
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
        row.innerHTML = "<td class=\"p-4 text-sm text-slate-500\" colspan=\"4\">No classes created yet.</td>";
        subjectClassTableBody.appendChild(row);
        return;
    }

    schoolClasses.forEach((schoolClass) => {
        const subjectNames = (schoolClass.subjects || [])
            .map((subject) => subject.name)
            .filter(Boolean)
            .join(", ");
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200 cursor-pointer hover:bg-slate-50";
        row.setAttribute("tabindex", "0");
        row.setAttribute("role", "button");
        row.innerHTML = `
            <td class="p-4">${schoolClass.className}</td>
            <td class="p-4">${schoolClass.grade}</td>
            <td class="p-4">${schoolClass.academicYear}</td>
            <td class="p-4 text-sm text-slate-600">${subjectNames || "-"}</td>
        `;
        row.addEventListener("click", () => {
            openAssignmentModal(schoolClass);
        });
        row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openAssignmentModal(schoolClass);
            }
        });
        subjectClassTableBody.appendChild(row);
    });
}

function renderAssignmentClassOptions() {
    if (!assignmentClassSelect) {
        return;
    }

    const currentValue = assignmentClassSelect.value;
    assignmentClassSelect.innerHTML = "<option value=\"\">Select class</option>";

    const sortedClasses = [...schoolClasses].sort((a, b) =>
        String(a.className).localeCompare(String(b.className), undefined, { sensitivity: "base" })
    );

    sortedClasses.forEach((schoolClass) => {
        const option = document.createElement("option");
        option.value = schoolClass.id;
        option.textContent = `${schoolClass.className} (Grade ${schoolClass.grade})`;
        assignmentClassSelect.appendChild(option);
    });

    if (currentValue && sortedClasses.some((schoolClass) => schoolClass.id === currentValue)) {
        assignmentClassSelect.value = currentValue;
    }
}

function renderAssignmentSubjectOptions(selectedIds = []) {
    if (!assignmentSubjectList) {
        return;
    }

    assignmentSubjectList.innerHTML = "";

    if (!assignmentClassSelect || !assignmentClassSelect.value) {
        assignmentSubjectList.innerHTML = "<p class=\"text-sm text-slate-500\">Select a class to manage subjects.</p>";
        return;
    }

    if (subjects.length === 0) {
        assignmentSubjectList.innerHTML = "<p class=\"text-sm text-slate-500\">No subjects available yet.</p>";
        return;
    }

    subjects.forEach((subject) => {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = subject.id;
        checkbox.checked = selectedIds.includes(subject.id);
        checkbox.disabled = !canManageClasses;

        const name = document.createElement("span");
        name.textContent = subject.name;

        label.append(checkbox, name);
        assignmentSubjectList.appendChild(label);
    });
}

function selectedAssignmentSubjectIds() {
    if (!assignmentSubjectList) {
        return [];
    }

    return Array.from(assignmentSubjectList.querySelectorAll("input[type=checkbox]:checked")).map((input) => input.value);
}

function openAssignmentModal(schoolClass) {
    if (!subjectAssignmentModal) {
        return;
    }

    subjectAssignmentModal.classList.remove("hidden");
    subjectAssignmentModal.classList.add("flex");

    if (assignmentClassSelect) {
        assignmentClassSelect.value = schoolClass ? schoolClass.id : "";
    }

    const selectedIds = schoolClass ? schoolClass.subjects.map((subject) => subject.id) : [];
    renderAssignmentSubjectOptions(selectedIds);
}

function closeAssignmentModal() {
    if (!subjectAssignmentModal) {
        return;
    }

    subjectAssignmentModal.classList.add("hidden");
    subjectAssignmentModal.classList.remove("flex");
}

function renderClasses() {
    classTableBody.innerHTML = "";
    const filterGrade = classGradeFilter ? classGradeFilter.value.trim() : "";
    const visibleClasses = filterGrade
        ? schoolClasses.filter((schoolClass) => String(schoolClass.grade).trim() === filterGrade)
        : schoolClasses;

    const sortedClasses = [...visibleClasses].sort((a, b) => {
        const gradeA = parseInt(a.grade, 10);
        const gradeB = parseInt(b.grade, 10);
        if (gradeA !== gradeB) {
            return gradeA - gradeB;
        }
        return a.className.localeCompare(b.className, undefined, { sensitivity: "base" });
    });

    sortedClasses.forEach((schoolClass) => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        row.innerHTML = `
            <td class="p-2">${schoolClass.className}</td>
            <td class="p-2">${schoolClass.grade}</td>
            <td class="p-2">${schoolClass.academicYear}</td>
            <td class="p-2 pr-24">${schoolClass.notes || ""}</td>
            <td class="p-2 pl-0"></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs";
        editButton.textContent = "Edit";
        editButton.disabled = !canManageClasses;
        editButton.addEventListener("click", () => {
            classIdInput.value = String(schoolClass.id);
            classGradeInput.value = schoolClass.grade;
            classYearInput.value = schoolClass.academicYear;
            if (classNotesInput) classNotesInput.value = schoolClass.notes || "";
            const match = schoolClass.className.match(/^Grade\s+\d+\s*-\s*(.+)$/i);
            if (classSuffixInput) classSuffixInput.value = match ? match[1].trim().toUpperCase() : schoolClass.className;
            updateClassName();
        });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
      "rounded-lg bg-red-600 px-3 py-1 text-xs text-white";
    deleteButton.textContent = "Delete";
    deleteButton.disabled = !canManageClasses;
    deleteButton.addEventListener("click", async () => {
      if (
        !window.confirm(
          `Are you sure you want to delete class "${schoolClass.className}"?`,
        )
      ) {
        return;
      }
      try {
        await requestJson(`/api/admin/classes/${schoolClass.id}`, {
          method: "DELETE",
        });
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

function teacherStatusLabel(status) {
    switch (status) {
        case "ACTIVE":
            return "Active";
        case "INACTIVE":
            return "Inactive";
        case "ON_LEAVE":
            return "On Leave";
        default:
            return status || "Unknown";
    }
}

function teacherStatusClass(status) {
    switch (status) {
        case "ACTIVE":
            return "bg-emerald-100 text-emerald-800";
        case "INACTIVE":
            return "bg-amber-100 text-amber-800";
        case "ON_LEAVE":
            return "bg-violet-100 text-violet-800";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function buildTeacherQuery() {
    const params = new URLSearchParams();
    const keyword = teacherSearchInput ? teacherSearchInput.value.trim() : "";
    const subjectId = teacherFilterSubjectInput ? teacherFilterSubjectInput.value.trim() : "";
    const classId = teacherFilterClassInput ? teacherFilterClassInput.value.trim() : "";
    const status = teacherFilterStatusInput ? teacherFilterStatusInput.value.trim() : "";

    if (keyword) params.set("keyword", keyword);
    if (subjectId) params.set("subjectId", subjectId);
    if (classId) params.set("classId", classId);
    if (status) params.set("status", status);

    return `/api/admin/teachers${params.toString() ? `?${params.toString()}` : ""}`;
}

function populateTeacherSubjectOptions() {
    const selects = [teacherSubjectInput, teacherFilterSubjectInput].filter(Boolean);
    selects.forEach((select) => {
        const currentValue = select.value;
        const defaultText = select === teacherFilterSubjectInput ? "All Subjects" : "Select subject";
        select.innerHTML = `<option value="">${defaultText}</option>`;
        subjects.forEach((subject) => {
            const option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

function populateTeacherClassOptions() {
    const selects = [teacherClassInput, teacherFilterClassInput].filter(Boolean);
    selects.forEach((select) => {
        const currentValue = select.value;
        const defaultText = select === teacherFilterClassInput ? "All Classes" : "Select class";
        select.innerHTML = `<option value="">${defaultText}</option>`;
        schoolClasses.forEach((schoolClass) => {
            const option = document.createElement("option");
            option.value = schoolClass.id;
            option.textContent = schoolClass.className;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

async function loadTeacherStats() {
    if (!teacherStatTotal) {
        return;
    }
    const stats = await requestJson("/api/admin/teachers/stats");
    teacherStatTotal.textContent = stats.totalTeachers || 0;
    teacherStatActive.textContent = stats.activeTeachers || 0;
    teacherStatInactive.textContent = stats.inactiveTeachers || 0;
    teacherStatOnLeave.textContent = stats.onLeaveTeachers || 0;
}

function renderTeachers() {
    if (!teacherTableBody) {
        return;
    }
    teacherTableBody.innerHTML = "";

    if (teachers.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = '<td class="p-4 text-sm text-slate-500" colspan="6">No teacher records found.</td>';
        teacherTableBody.appendChild(row);
        return;
    }

    teachers.forEach((teacher) => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-100 align-top last:border-0";

        const idCell = document.createElement("td");
        idCell.className = "p-3 font-semibold text-slate-800";
        idCell.textContent = teacher.teacherId || "-";

        const teacherCell = document.createElement("td");
        teacherCell.className = "p-3";
        const teacherName = document.createElement("p");
        teacherName.className = "font-semibold text-slate-900";
        teacherName.textContent = teacher.fullName || [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") || "-";
        const teacherContact = document.createElement("p");
        teacherContact.className = "mt-1 text-xs text-slate-500";
        teacherContact.textContent = [teacher.email, teacher.phone].filter(Boolean).join(" | ") || "No contact details";
        teacherCell.append(teacherName, teacherContact);

        const subjectCell = document.createElement("td");
        subjectCell.className = "p-3 text-slate-700";
        subjectCell.textContent = teacher.subjectName || "-";

        const classCell = document.createElement("td");
        classCell.className = "p-3 text-slate-700";
        classCell.textContent = teacher.className || "-";

        const statusCell = document.createElement("td");
        statusCell.className = "p-3";
        const statusBadge = document.createElement("span");
        statusBadge.className = `rounded-full px-2.5 py-1 text-xs font-semibold ${teacherStatusClass(teacher.status)}`;
        statusBadge.textContent = teacherStatusLabel(teacher.status);
        statusCell.appendChild(statusBadge);

        const actionsCell = document.createElement("td");
        actionsCell.className = "p-3";
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700";
        editButton.textContent = "Edit";
        editButton.disabled = !canManageTeachers;
        editButton.addEventListener("click", () => editTeacher(teacher.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white";
        deleteButton.textContent = "Delete";
        deleteButton.disabled = !canManageTeachers;
        deleteButton.addEventListener("click", () => deleteTeacher(teacher.id, teacher.fullName || teacher.teacherId || "this teacher"));
        actionsCell.append(editButton, deleteButton);

        row.append(idCell, teacherCell, subjectCell, classCell, statusCell, actionsCell);
        teacherTableBody.appendChild(row);
    });
}

async function loadTeachers() {
    if (!teacherTableBody) {
        return;
    }
    const [teacherData] = await Promise.all([
        requestJson(buildTeacherQuery()),
        loadTeacherStats()
    ]);
    teachers = teacherData;
    renderTeachers();
}

function resetTeacherForm() {
    if (!teacherForm) {
        return;
    }
    teacherIdInput.value = "";
    teacherCodeInput.value = "";
    teacherFirstNameInput.value = "";
    teacherLastNameInput.value = "";
    teacherEmailInput.value = "";
    teacherPhoneInput.value = "";
    teacherGenderInput.value = "";
    teacherSubjectInput.value = "";
    teacherClassInput.value = "";
    teacherQualificationInput.value = "";
    teacherStatusInput.value = "ACTIVE";
}

function teacherPayloadFromForm() {
    const teacherId = teacherCodeInput.value.trim();
    const firstName = teacherFirstNameInput.value.trim();
    const lastName = teacherLastNameInput.value.trim();
    const status = teacherStatusInput.value.trim();

    if (!teacherId || !firstName || !lastName || !status) {
        window.alert("Teacher ID, first name, last name, and status are required.");
        return null;
    }

    return {
        teacherId,
        firstName,
        lastName,
        email: teacherEmailInput.value.trim(),
        phone: teacherPhoneInput.value.trim(),
        gender: teacherGenderInput.value.trim(),
        subjectId: teacherSubjectInput.value.trim(),
        classId: teacherClassInput.value.trim(),
        qualification: teacherQualificationInput.value.trim(),
        status
    };
}

async function submitTeacherForm(event) {
    event.preventDefault();
    if (!canManageTeachers) {
        return;
    }

    const payload = teacherPayloadFromForm();
    if (!payload) {
        return;
    }

    const id = teacherIdInput.value.trim();
    try {
        if (id) {
            await requestJson(`/api/admin/teachers/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Teacher updated successfully!");
        } else {
            await requestJson("/api/admin/teachers", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("Teacher created successfully!");
        }
        resetTeacherForm();
        await loadTeachers();
    } catch (error) {
        window.alert(`Failed to save teacher: ${error.message}`);
    }
}

async function editTeacher(id) {
    if (!id) {
        return;
    }
    try {
        const teacher = await requestJson(`/api/admin/teachers/${id}`);
        teacherIdInput.value = teacher.id || "";
        teacherCodeInput.value = teacher.teacherId || "";
        teacherFirstNameInput.value = teacher.firstName || "";
        teacherLastNameInput.value = teacher.lastName || "";
        teacherEmailInput.value = teacher.email || "";
        teacherPhoneInput.value = teacher.phone || "";
        teacherGenderInput.value = teacher.gender || "";
        teacherSubjectInput.value = teacher.subjectId || "";
        teacherClassInput.value = teacher.classId || "";
        teacherQualificationInput.value = teacher.qualification || "";
        teacherStatusInput.value = teacher.status || "ACTIVE";
        teacherFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        window.alert(`Failed to load teacher: ${error.message}`);
    }
}

async function deleteTeacher(id, label) {
    if (!id || !window.confirm(`Are you sure you want to delete ${label}?`)) {
        return;
    }
    try {
        await requestJson(`/api/admin/teachers/${id}`, { method: "DELETE" });
        await loadTeachers();
        window.alert("Teacher deleted successfully!");
    } catch (error) {
        window.alert(`Failed to delete teacher: ${error.message}`);
    }
}

async function refreshAll() {
  const [subjectData, classData] = await Promise.all([
    requestJson("/api/admin/subjects"),
    requestJson("/api/admin/classes"),
  ]);

  subjects = subjectData;
  schoolClasses = classData;

    renderSubjects();
    renderClasses();
    renderSubjectPageClasses();
    renderAssignmentClassOptions();
    populateTeacherSubjectOptions();
    populateTeacherClassOptions();

    if (assignmentClassSelect && assignmentClassSelect.value) {
        const selectedClass = schoolClasses.find((schoolClass) => schoolClass.id === assignmentClassSelect.value);
        const selectedIds = selectedClass ? selectedClass.subjects.map((subject) => subject.id) : [];
        renderAssignmentSubjectOptions(selectedIds);
    } else {
        renderAssignmentSubjectOptions([]);
    }

    window.dispatchEvent(new CustomEvent("classes:updated", { detail: schoolClasses }));

    if (pageFromHash() === "teachers") {
        await loadTeachers();
    }
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
        body: JSON.stringify(payload),
      });
      window.alert("Subject updated successfully!");
    } else {
      await requestJson("/api/admin/subjects", {
        method: "POST",
        body: JSON.stringify(payload),
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
    const notes = classNotesInput ? classNotesInput.value.trim() : "";

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

    const suffixValue = classSuffixInput ? classSuffixInput.value.trim() : "";
    if (!suffixValue || !/^[A-Za-z]{1,2}$/.test(suffixValue)) {
        window.alert("Class letter must be 1 or 2 letters (e.g. A or Em).");
        return;
    }

    if (!/^\d+$/.test(academicYear)) {
        window.alert("Academic Year must be a number.");
        return;
    }

    const existing = id ? schoolClasses.find((schoolClass) => schoolClass.id === id) : null;
    const payload = {
        className,
        grade,
        academicYear,
        notes,
        subjectIds: existing ? existing.subjects.map((subject) => subject.id) : []
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

if (classGradeInput) {
    classGradeInput.addEventListener("input", updateClassName);
}
if (classSuffixInput) {
    classSuffixInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
        updateClassName();
    });
}

if (assignmentClassSelect) {
    assignmentClassSelect.addEventListener("change", () => {
        const selectedClass = schoolClasses.find((schoolClass) => schoolClass.id === assignmentClassSelect.value);
        const selectedIds = selectedClass ? selectedClass.subjects.map((subject) => subject.id) : [];
        renderAssignmentSubjectOptions(selectedIds);
    });
}

if (assignmentResetButton) {
    assignmentResetButton.addEventListener("click", () => {
        if (assignmentClassSelect) {
            assignmentClassSelect.value = "";
        }
        renderAssignmentSubjectOptions([]);
    });
}

if (assignmentCloseButton) {
    assignmentCloseButton.addEventListener("click", closeAssignmentModal);
}

if (subjectAssignmentModal) {
    subjectAssignmentModal.addEventListener("click", (event) => {
        if (event.target === subjectAssignmentModal) {
            closeAssignmentModal();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && subjectAssignmentModal && !subjectAssignmentModal.classList.contains("hidden")) {
        closeAssignmentModal();
    }
});

if (subjectAssignmentForm) {
    subjectAssignmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!canManageClasses) {
            return;
        }

        const classId = assignmentClassSelect ? assignmentClassSelect.value.trim() : "";
        if (!classId) {
            window.alert("Please select a class.");
            return;
        }

        const schoolClass = schoolClasses.find((item) => item.id === classId);
        if (!schoolClass) {
            window.alert("Selected class not found.");
            return;
        }

        const payload = {
            className: schoolClass.className,
            grade: schoolClass.grade,
            academicYear: schoolClass.academicYear,
            notes: schoolClass.notes || "",
            subjectIds: selectedAssignmentSubjectIds()
        };

        try {
            await requestJson(`/api/admin/classes/${classId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Subjects assigned successfully!");
            await refreshAll();
            closeAssignmentModal();
        } catch (error) {
            window.alert(`Failed to assign subjects: ${error.message}`);
        }
    });
}

if (classGradeFilter) {
    classGradeFilter.addEventListener("change", renderClasses);
}

if (teacherForm) {
    teacherForm.addEventListener("submit", submitTeacherForm);
}

if (teacherResetButton) {
    teacherResetButton.addEventListener("click", resetTeacherForm);
}

if (teacherRefreshButton) {
    teacherRefreshButton.addEventListener("click", () => {
        loadTeachers().catch((error) => {
            window.alert(`Failed to refresh teachers: ${error.message}`);
        });
    });
}

[teacherSearchInput, teacherFilterSubjectInput, teacherFilterClassInput, teacherFilterStatusInput]
    .filter(Boolean)
    .forEach((element) => {
        const eventName = element === teacherSearchInput ? "input" : "change";
        element.addEventListener(eventName, () => {
            loadTeachers().catch((error) => {
                window.alert(`Failed to filter teachers: ${error.message}`);
            });
        });
    });

refreshAll().catch((error) => {
  window.alert(`Failed to load data: ${error.message}`);
});
