const AUTH_STORAGE_KEY = "lmsAuth";

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
            return "Teacher";
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
