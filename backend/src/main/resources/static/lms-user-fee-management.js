/* ===================================================================
   User & Fee Management – CRUD front-end logic
   Depends on: auth.js (loaded first), lms-class-management.js (API_BASE)
   =================================================================== */

// ─── DOM references: Users ──────────────────────────────────────────
const userForm = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const userNameInput = document.getElementById("user-name");
const userEmailInput = document.getElementById("user-email");
const userPhoneInput = document.getElementById("user-phone");
const userClassSelect = document.getElementById("user-class");
const userResetButton = document.getElementById("user-reset");
const userTableBody = document.getElementById("user-table-body");

// ─── DOM references: Fees ───────────────────────────────────────────
const feeForm = document.getElementById("fee-form");
const feeIdInput = document.getElementById("fee-id");
const feeUserSelect = document.getElementById("fee-user");
const feeDescriptionInput = document.getElementById("fee-description");
const feeAmountInput = document.getElementById("fee-amount");
const feeDueDateInput = document.getElementById("fee-due-date");
const feeStatusInput = document.getElementById("fee-status");
const feeResetButton = document.getElementById("fee-reset");
const feeTableBody = document.getElementById("fee-table-body");
const feeFilterUser = document.getElementById("fee-filter-user");

// ─── State ──────────────────────────────────────────────────────────
let users = [];
let fees = [];
// schoolClasses is declared and shared from lms-class-management.js

function normalizeFeeId(rawId) {
    if (!rawId) {
        return "";
    }
    if (typeof rawId === "object" && rawId.$oid) {
        return rawId.$oid;
    }
    return String(rawId);
}

// ─── Helpers (reuse API_BASE from lms-class-management.js) ──────────
async function requestJsonUF(path, options = {}) {
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

// ─── Reset helpers ──────────────────────────────────────────────────
function resetUserForm() {
    userIdInput.value = "";
    userNameInput.value = "";
    userEmailInput.value = "";
    userPhoneInput.value = "";
    if (userClassSelect) {
        userClassSelect.value = "";
    }
}

function resetFeeForm() {
    feeIdInput.value = "";
    feeUserSelect.value = "";
    feeDescriptionInput.value = "";
    feeAmountInput.value = "";
    feeDueDateInput.value = "";
    feeStatusInput.value = "PENDING";
}

// ─── Render: Users ──────────────────────────────────────────────────
function renderUsers() {
    userTableBody.innerHTML = "";

    const classLookup = new Map(
        schoolClasses.map((schoolClass) => [schoolClass.id, schoolClass])
    );

    const studentUsers = users.filter((user) => user.role === "student");

    studentUsers.forEach((user) => {
        const classInfo = user.classId ? classLookup.get(user.classId) : null;
        const classLabel = classInfo ? `${classInfo.className} (Grade ${classInfo.grade})` : "—";
        const emailLabel = user.email ? user.email : "—";
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";

        row.innerHTML = `
            <td class="p-2 font-medium">${user.name}</td>
            <td class="p-2">${emailLabel}</td>
            <td class="p-2">${user.phone || "—"}</td>
            <td class="p-2">${classLabel}</td>
            <td class="p-2"></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            userIdInput.value = user.id;
            userNameInput.value = user.name;
            userEmailInput.value = user.email || "";
            userPhoneInput.value = user.phone || "";
            if (userClassSelect) {
                userClassSelect.value = user.classId || "";
            }
            window.location.hash = "#users";
            const formCard = document.getElementById("user-form-card");
            if (formCard) {
                formCard.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "rounded-lg bg-red-600 px-3 py-1 text-xs text-white";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(`Are you sure you want to delete user "${user.name}"? All associated fees will also be deleted.`)) {
                return;
            }
            try {
                await requestJsonUF(`/api/admin/users/${user.id}`, { method: "DELETE" });
                await refreshUsersAndFees();
                window.alert("User deleted successfully!");
            } catch (error) {
                window.alert(`Failed to delete user: ${error.message}`);
            }
        });

        actionsCell.append(editButton, deleteButton);
        userTableBody.appendChild(row);
    });
}

// ─── Render: Fees ───────────────────────────────────────────────────
function renderFees() {
    feeTableBody.innerHTML = "";

    const filterUserId = feeFilterUser.value;
    const visibleFees = filterUserId ? fees.filter((f) => f.userId === filterUserId) : fees;

    visibleFees.forEach((fee) => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";

        const statusBadge = {
            PAID: "bg-green-100 text-green-800",
            PENDING: "bg-yellow-100 text-yellow-800",
            OVERDUE: "bg-red-100 text-red-800"
        }[fee.status] || "bg-slate-100 text-slate-800";

        row.innerHTML = `
            <td class="p-2 font-medium">${fee.userName}</td>
            <td class="p-2">${fee.description}</td>
            <td class="p-2">LKR ${Number(fee.amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
            <td class="p-2">${fee.dueDate}</td>
            <td class="p-2"><span class="rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge}">${fee.status}</span></td>
            <td class="p-2"></td>
        `;

        const actionsCell = row.querySelector("td:last-child");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            if (!fee.id) {
                window.alert("This fee record is missing an id. Please refresh and try again.");
                return;
            }
            feeIdInput.value = fee.id;
            feeUserSelect.value = fee.userId;
            feeDescriptionInput.value = fee.description;
            feeAmountInput.value = fee.amount;
            feeDueDateInput.value = fee.dueDate;
            feeStatusInput.value = fee.status;
            window.location.hash = "#fees";
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "rounded-lg bg-red-600 px-3 py-1 text-xs text-white";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(`Are you sure you want to delete this fee record?`)) {
                return;
            }
            try {
                await requestJsonUF(`/api/admin/fees/${fee.id}`, { method: "DELETE" });
                await refreshUsersAndFees();
                window.alert("Fee deleted successfully!");
            } catch (error) {
                window.alert(`Failed to delete fee: ${error.message}`);
            }
        });

        actionsCell.append(editButton, deleteButton);
        feeTableBody.appendChild(row);
    });
}

// ─── Populate user dropdowns (fee form + filter) ────────────────────
function populateUserDropdowns() {
    const studentUsers = users.filter((user) => user.role === "student");

    // Fee form user select
    const currentFeeUser = feeUserSelect.value;
    feeUserSelect.innerHTML = '<option value="">Select user</option>';
    studentUsers.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (${user.email || "No email"})`;
        feeUserSelect.appendChild(option);
    });
    feeUserSelect.value = currentFeeUser;

    // Fee filter user select
    const currentFilter = feeFilterUser.value;
    feeFilterUser.innerHTML = '<option value="">All Users</option>';
    studentUsers.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (${user.email || "No email"})`;
        feeFilterUser.appendChild(option);
    });
    feeFilterUser.value = currentFilter;
}

// ─── Populate class dropdown (student form) ────────────────────────
function populateClassDropdown() {
    if (!userClassSelect) {
        return;
    }

    const currentClass = userClassSelect.value;
    userClassSelect.innerHTML = '<option value="">Select class</option>';

    schoolClasses
        .slice()
        .sort((a, b) => String(a.className).localeCompare(String(b.className), undefined, { sensitivity: "base" }))
        .forEach((schoolClass) => {
            const option = document.createElement("option");
            option.value = schoolClass.id;
            option.textContent = `${schoolClass.className} (Grade ${schoolClass.grade})`;
            userClassSelect.appendChild(option);
        });

    userClassSelect.value = currentClass;
}

// ─── Refresh all user & fee data ────────────────────────────────────
async function refreshUsersAndFees() {
    const [userData, feeData, classData] = await Promise.all([
        requestJsonUF("/api/admin/users"),
        requestJsonUF("/api/admin/fees"),
        requestJsonUF("/api/admin/classes")
    ]);

    users = userData;
    fees = feeData.map((fee) => ({
        ...fee,
        id: normalizeFeeId(fee.id || fee._id)
    }));
    schoolClasses = classData;

    populateUserDropdowns();
    populateClassDropdown();
    renderUsers();
    renderFees();
}

window.addEventListener("classes:updated", () => {
    populateClassDropdown();
});

// ─── Form submit: Users ─────────────────────────────────────────────
userForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = userIdInput.value.trim();
    const name = userNameInput.value.trim();
    const email = userEmailInput.value.trim();
    const phone = userPhoneInput.value.trim();
    const classId = userClassSelect ? userClassSelect.value.trim() : "";

    if (!name) {
        window.alert("Name is required.");
        return;
    }

    const payload = { name, email: email || null, role: "student", phone: phone || null, classId: classId || null };

    try {
        if (id) {
            await requestJsonUF(`/api/admin/users/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("User updated successfully!");
        } else {
            await requestJsonUF("/api/admin/users", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("User created successfully!");
        }

        resetUserForm();
        await refreshUsersAndFees();
    } catch (error) {
        window.alert(`Failed to save user: ${error.message}`);
    }
});

// ─── Form submit: Fees ──────────────────────────────────────────────
feeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = feeIdInput.value.trim();
    const userId = feeUserSelect.value.trim();
    const description = feeDescriptionInput.value.trim();
    const amount = parseFloat(feeAmountInput.value);
    const dueDate = feeDueDateInput.value.trim();
    const status = feeStatusInput.value.trim();

    if (!userId || !description || !dueDate || !status) {
        window.alert("All fields are required.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        window.alert("Amount must be a positive number.");
        return;
    }

    const payload = { userId, description, amount, dueDate, status };

    try {
        if (id) {
            await requestJsonUF(`/api/admin/fees/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Fee updated successfully!");
        } else {
            await requestJsonUF("/api/admin/fees", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("Fee created successfully!");
        }

        resetFeeForm();
        await refreshUsersAndFees();
    } catch (error) {
        window.alert(`Failed to save fee: ${error.message}`);
    }
});

// ─── Reset buttons ──────────────────────────────────────────────────
userResetButton.addEventListener("click", resetUserForm);
feeResetButton.addEventListener("click", resetFeeForm);

// ─── Filter change re-renders fees ──────────────────────────────────
feeFilterUser.addEventListener("change", renderFees);

// ─── Initial load ───────────────────────────────────────────────────
refreshUsersAndFees().catch((error) => {
    console.error("Failed to load users/fees:", error.message);
});
