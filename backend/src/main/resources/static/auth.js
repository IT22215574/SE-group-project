const AUTH_STORAGE_KEY = "lmsAuth";

function inferRoleFromEmail(email) {
    if (!email) {
        return "student";
    }

    const normalized = String(email).trim().toLowerCase();
    const [localPart = "", domain = ""] = normalized.split("@");

    if (localPart.startsWith("admin") || domain === "admin.com") {
        return "admin";
    }
    if (localPart.startsWith("teacher") || domain === "teacher.com") {
        return "teacher";
    }
    if (localPart.startsWith("student") || domain === "student.com") {
        return "student";
    }

    return "student";
}

function getAuthState() {
    try {
        return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY)) || null;
    } catch (_error) {
        return null;
    }
}

function setAuthState(authState) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
}

function clearAuthState() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function requireAuth() {
    return getAuthState();
}

function roleLabel(role) {
    switch (role) {
        case "admin":
            return "Admin";
        case "teacher":
            return "User";
        case "student":
            return "Student";
        default:
            return "Visitor";
    }
}

function roleCanEdit(role) {
    return role === "admin" || role === "teacher";
}

function roleCanManageSubjects(role) {
    return role === "admin" || role === "teacher";
}

function roleCanManageClasses(role) {
    return role === "admin" || role === "teacher";
}
