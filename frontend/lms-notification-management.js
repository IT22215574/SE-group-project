// Elements
const resultForm = document.getElementById("result-form");
const resultIdInput = document.getElementById("result-id");
const resultStudentSelect = document.getElementById("result-student");
const resultClassSelect = document.getElementById("result-class");
const resultSubjectSelect = document.getElementById("result-subject");
const resultMarksInput = document.getElementById("result-marks");
const resultResetButton = document.getElementById("result-reset");
const resultTableBody = document.getElementById("result-table-body");
const publishResultsBtn = document.getElementById("publish-results-btn");
const filterResultClassSelect = document.getElementById("filter-result-class");

const notificationsList = document.getElementById("notifications-list");
const studentResultsGrid = document.getElementById("student-results-grid");
const clearNotificationsBtn = document.getElementById("clear-notifications-btn");
const navNotifBadge = document.getElementById("nav-notif-badge");

let resultUsers = [];
let resultsList = [];
let notificationsData = [];

// Initialize data based on role
async function initNotificationsModule() {
    if (!currentAuth) return;
    
    if (currentRole === "teacher" || currentRole === "admin") {
        await fetchDropdownData();
        await loadTeacherResults();
        
        filterResultClassSelect.addEventListener("change", loadTeacherResults);
        
        resultForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await submitResult();
        });
        
        resultResetButton.addEventListener("click", resetResultForm);
        
        publishResultsBtn.addEventListener("click", async () => {
            const classID = filterResultClassSelect.value;
            if (!classID) {
                alert("Please first select a class from the 'Filter Class' dropdown on the right, then click Publish.");
                return;
            }

            // Find all unique subjects in the currently loaded results for this class
            const subjects = [...new Set(resultsList.map(r => r.subject).filter(Boolean))];

            if (!subjects.length) {
                alert("No results found for class " + classID + ". Add results first.");
                return;
            }

            if (!confirm(`Publish results for class "${classID}" (${subjects.join(", ")})?\nThis will notify all students in this class.`)) {
                return;
            }

            try {
                // Publish each subject separately
                for (const subject of subjects) {
                    await requestJson("/api/results/publish", {
                        method: "POST",
                        body: JSON.stringify({ classID, subject })
                    });
                }
                alert("Results published successfully! Students have been notified.");
                await loadTeacherResults();
            } catch (err) {
                alert("Failed to publish: " + err.message);
            }
        });
    } else if (currentRole === "student") {
        await loadStudentResults();
        await loadStudentNotifications();
        
        clearNotificationsBtn.addEventListener("click", async () => {
            if (!confirm("Clear all notifications?")) return;
            try {
                // To clear notifications, we need user ID. Since currentAuth has email, 
                // we should fetch the user object first, or the backend should use email.
                // Assuming we can fetch the user ID:
                const userObj = await getUserByEmail(currentAuth.email);
                if (userObj) {
                    await requestJson(`/api/notifications/clear/${userObj.id}`, { method: "DELETE" });
                    await loadStudentNotifications();
                }
            } catch (err) {
                console.error("Clear notifications failed:", err);
            }
        });
    }
}

async function getUserByEmail(email) {
    try {
        const users = await requestJson("/api/admin/users");
        return users.find(u => u.email === email);
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function fetchDropdownData() {
    try {
        const [usersData, classData, subjectData] = await Promise.all([
            requestJson("/api/admin/users").catch(() => []),
            requestJson("/api/admin/classes").catch(() => []),
            requestJson("/api/admin/subjects").catch(() => [])
        ]);
        
        resultUsers = usersData.filter(u => u.role === "student");
        
        resultStudentSelect.innerHTML = '<option value="">Select student</option>' + 
            resultUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
            
        const classOpts = classData.map(c => `<option value="${c.id}">${c.className}</option>`).join('');
        resultClassSelect.innerHTML = '<option value="">Select class</option>' + classOpts;
        filterResultClassSelect.innerHTML = '<option value="">All Classes</option>' + classOpts;
        
        resultSubjectSelect.innerHTML = '<option value="">Select subject</option>' + 
            subjectData.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
            
    } catch (err) {
        console.error("Failed to load dropdowns:", err);
    }
}

async function loadTeacherResults() {
    try {
        const classID = filterResultClassSelect.value;
        // If classID is empty, we might not have a "get all" endpoint in ResultController. 
        // We'll fetch all classes results if possible, or just the selected one.
        if (classID) {
            resultsList = await requestJson(`/api/results/class/${classID}`);
        } else {
            resultsList = await requestJson(`/api/results`);
        }
        
        renderTeacherResults();
    } catch (err) {
        console.error("Failed to load results:", err);
    }
}

function renderTeacherResults() {
    if (!resultsList.length) {
        resultTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">No results found. Select a class.</td></tr>`;
        return;
    }
    
    resultTableBody.innerHTML = resultsList.map(r => {
        const student = resultUsers.find(u => u.id === r.studentID);
        const stuName = student ? student.name : r.studentID;
        return `
        <tr class="border-b border-slate-200">
            <td class="p-2">${stuName}</td>
            <td class="p-2">${r.subject}</td>
            <td class="p-2 font-mono font-bold text-pink-600">${r.marks}</td>
            <td class="p-2 font-bold">${r.grade}</td>
            <td class="p-2">
                <span class="rounded-full px-2 py-1 text-xs font-semibold ${r.visible ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                    ${r.visible ? 'Published' : 'Pending'}
                </span>
            </td>
            <td class="p-2 flex gap-2">
                <button class="rounded border border-slate-300 px-2 py-1 text-xs" onclick="editResult('${r.id}', '${r.studentID}', '${r.classID}', '${r.subject}', ${r.marks})">Edit</button>
                <button class="rounded bg-red-600 px-2 py-1 text-xs text-white" onclick="deleteResult('${r.id}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

function resetResultForm() {
    resultIdInput.value = "";
    resultStudentSelect.value = "";
    resultClassSelect.value = "";
    resultSubjectSelect.value = "";
    resultMarksInput.value = "";
}

window.editResult = function(id, studentID, classID, subject, marks) {
    resultIdInput.value = id;
    resultStudentSelect.value = studentID;
    resultClassSelect.value = classID;
    resultSubjectSelect.value = subject;
    resultMarksInput.value = marks;
    document.querySelector('a[href="#results"]').click();
}

window.deleteResult = async function(id) {
    if (!confirm("Delete result?")) return;
    try {
        await requestJson(`/api/results/${id}`, { method: "DELETE" });
        await loadTeacherResults();
    } catch (err) {
        alert("Failed to delete: " + err.message);
    }
}

async function submitResult() {
    const id = resultIdInput.value;
    const payload = {
        studentID: resultStudentSelect.value,
        classID: resultClassSelect.value,
        subject: resultSubjectSelect.value,
        marks: parseInt(resultMarksInput.value, 10)
    };
    
    try {
        if (id) {
            await requestJson(`/api/results/${id}`, { method: "PUT", body: JSON.stringify(payload) });
            alert("Result updated!");
        } else {
            await requestJson(`/api/results`, { method: "POST", body: JSON.stringify(payload) });
            alert("Result created!");
        }
        resetResultForm();
        
        // Auto-select the class we just added to in the filter
        filterResultClassSelect.value = payload.classID;
        await loadTeacherResults();
    } catch (err) {
        alert("Failed to save: " + err.message);
    }
}

// Student functions
async function loadStudentResults() {
    try {
        const userObj = await getUserByEmail(currentAuth.email);
        if (!userObj) return;
        
        const data = await requestJson(`/api/results/my/${userObj.id}`);
        if (!data.length) {
            studentResultsGrid.innerHTML = `<p class="text-sm text-slate-500">No published results.</p>`;
        } else {
            studentResultsGrid.innerHTML = data.map(r => `
                <div class="rounded-2xl border border-slate-200 p-4 shadow-sm bg-slate-50">
                    <h3 class="font-bold text-slate-800">${r.subject}</h3>
                    <div class="mt-2 text-3xl font-mono font-bold text-indigo-600">${r.marks}%</div>
                    <div class="mt-4 flex justify-between items-center text-sm">
                        <span class="text-slate-600">Grade: <strong class="text-slate-900">${r.grade}</strong></span>
                        <span class="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Published</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("Failed to load student results:", err);
    }
}

async function loadStudentNotifications() {
    try {
        const userObj = await getUserByEmail(currentAuth.email);
        if (!userObj) return;
        
        const data = await requestJson(`/api/notifications/${userObj.id}`);
        const unread = data.filter(n => !n.read).length;
        
        if (unread > 0) {
            navNotifBadge.textContent = unread;
            navNotifBadge.classList.remove("hidden");
        } else {
            navNotifBadge.classList.add("hidden");
        }
        
        if (!data.length) {
            notificationsList.innerHTML = `<p class="text-sm text-slate-500">No notifications.</p>`;
        } else {
            notificationsList.innerHTML = data.map(n => `
                <div class="flex items-start justify-between rounded-xl border ${n.read ? 'border-slate-200 bg-white' : 'border-indigo-200 bg-indigo-50'} p-4 transition">
                    <div>
                        <p class="text-sm font-medium ${n.read ? 'text-slate-600' : 'text-slate-900'}">${n.message}</p>
                        <p class="mt-1 text-xs text-slate-500">${new Date(n.createdAt).toLocaleString()} · ${n.read ? 'Read' : 'Unread'}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button class="text-xs text-indigo-600 hover:underline" onclick="toggleNotifRead('${n.id}')">${n.read ? 'Mark Unread' : 'Mark Read'}</button>
                        <button class="text-xs text-red-600 hover:underline" onclick="deleteNotif('${n.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("Failed to load notifications:", err);
    }
}

window.toggleNotifRead = async function(id) {
    try {
        await requestJson(`/api/notifications/${id}/read`, { method: "PUT" });
        await loadStudentNotifications();
    } catch (err) {
        console.error("Toggle read failed:", err);
    }
}

window.deleteNotif = async function(id) {
    try {
        await requestJson(`/api/notifications/${id}`, { method: "DELETE" });
        await loadStudentNotifications();
    } catch (err) {
        console.error("Delete notif failed:", err);
    }
}

initNotificationsModule();
