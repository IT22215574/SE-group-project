// Relies on API_BASE and requestJson from lms-class-management.js (loaded before this)

const attClassSelect = document.getElementById("att-class-select");
const attDateInput = document.getElementById("att-date-input");
const attLoadBtn = document.getElementById("att-load-btn");

const attFormWrapper = document.getElementById("att-form-wrapper");
const attFormSubtitle = document.getElementById("att-form-subtitle");
const attModeBadge = document.getElementById("att-mode-badge");
const attStudentTableBody = document.getElementById("att-student-table-body");

const attSaveBtn = document.getElementById("att-save-btn");
const attUpdateBtn = document.getElementById("att-update-btn");
const attDeleteBtn = document.getElementById("att-delete-btn");

const attReportWrapper = document.getElementById("att-report-wrapper");
const attReportBtn = document.getElementById("att-report-btn");
const attReportContent = document.getElementById("att-report-content");
const attReportDays = document.getElementById("att-report-days");
const attReportStudents = document.getElementById("att-report-students");
const attReportTableBody = document.getElementById("att-report-table-body");
const attDownloadReportBtn = document.getElementById("att-download-report-btn");

let currentAttendanceId = null;
let currentStudents = [];
let currentReportData = null;
let attendanceInitialised = false;

// Load classes on init
async function initAttendance() {
    try {
        const classes = await requestJson('/api/admin/classes');
        attClassSelect.innerHTML = '<option value="">-- Select a class --</option>';
        classes.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.className + (c.grade ? " (Grade " + c.grade + ")" : "");
            attClassSelect.appendChild(opt);
        });
        // Default to today and restrict future dates
        const today = new Date().toISOString().split('T')[0];
        attDateInput.value = today;
        attDateInput.max = today;
    } catch (err) {
        console.error("Failed to load classes for attendance:", err);
    }
}

// When the section becomes visible, init (we can listen to hash changes basically)
window.addEventListener("hashchange", () => {
    if (window.location.hash === "#attendance") {
        if (attClassSelect.options.length <= 1) {
            initAttendance();
        }
    } else {
        if (attDownloadReportBtn) attDownloadReportBtn.classList.add("hidden");
        attReportContent.classList.add("hidden");
        currentReportData = null;
    }
});

// Load Attendance Records
attLoadBtn.addEventListener("click", async () => {
    const classId = attClassSelect.value;
    const date = attDateInput.value;
    
    if (!classId || !date) {
        alert("Please select both a class and a date.");
        return;
    }
    
    try {
        attFormWrapper.classList.add("hidden");
        attReportWrapper.classList.add("hidden");
        
        // 1. Check if attendance exists
        const attResponse = await requestJson(`/api/attendance?classId=${classId}&date=${date}`);
        
        // 2. Fetch students for this class
        const students = await requestJson(`/api/admin/users?role=student&classId=${encodeURIComponent(classId)}`);
        if (!students || students.length === 0) {
            alert("No students found in this class.");
            return;
        }
        
        currentStudents = students;
        
        if (attResponse && attResponse.exists !== false) {
            // Existing attendance
            setupEditMode(attResponse, students);
        } else {
            // New attendance
            setupCreateMode(students);
        }
        
        attFormSubtitle.textContent = `Date: ${date} | Class: ${attClassSelect.options[attClassSelect.selectedIndex].text}`;
        attFormWrapper.classList.remove("hidden");
        attReportWrapper.classList.remove("hidden");
        attReportContent.classList.add("hidden"); // hide report content until explicitly generated
        if (attDownloadReportBtn) attDownloadReportBtn.classList.add("hidden");
        currentReportData = null;
        
    } catch (err) {
        alert("Error loading attendance: " + err.message);
    }
});

function renderStudentTable(students, existingRecords = []) {
    attStudentTableBody.innerHTML = "";
    
    // Map existing statuses if any
    const statusMap = {};
    existingRecords.forEach(r => {
        statusMap[r.studentId] = r.status;
    });
    
    students.forEach(student => {
        const status = statusMap[student.id] || "PRESENT"; // Default to present for new
        
        const studentName = student.fullName || student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim();
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200 hover:bg-slate-50";
        
        row.innerHTML = `
            <td class="p-3 font-medium text-slate-900">${studentName || "-"}</td>
            <td class="p-3 text-center">
                <input type="radio" name="student_${student.id}" value="PRESENT" ${status === 'PRESENT' ? 'checked' : ''} class="w-4 h-4 text-teal-600 focus:ring-teal-600" />
            </td>
            <td class="p-3 text-center">
                <input type="radio" name="student_${student.id}" value="ABSENT" ${status === 'ABSENT' ? 'checked' : ''} class="w-4 h-4 text-red-600 focus:ring-red-600" />
            </td>
            <td class="p-3 text-center">
                <input type="radio" name="student_${student.id}" value="LATE" ${status === 'LATE' ? 'checked' : ''} class="w-4 h-4 text-amber-500 focus:ring-amber-500" />
            </td>
        `;
        
        attStudentTableBody.appendChild(row);
    });
}

function setupCreateMode(students) {
    currentAttendanceId = null;
    
    attModeBadge.textContent = "New Record";
    attModeBadge.className = "rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800";
    
    attSaveBtn.classList.remove("hidden");
    attUpdateBtn.classList.add("hidden");
    attDeleteBtn.classList.add("hidden");
    
    renderStudentTable(students);
}

function setupEditMode(attResponse, students) {
    currentAttendanceId = attResponse.id;
    
    attModeBadge.textContent = "Existing Record";
    attModeBadge.className = "rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800";
    
    attSaveBtn.classList.add("hidden");
    attUpdateBtn.classList.remove("hidden");
    attDeleteBtn.classList.remove("hidden");
    
    renderStudentTable(students, attResponse.records);
}

function getGridData() {
    const classId = attClassSelect.value;
    const date = attDateInput.value;
    const studentsData = [];
    
    currentStudents.forEach(s => {
        const selectedRadio = document.querySelector(`input[name="student_${s.id}"]:checked`);
        if (selectedRadio) {
            studentsData.push({
                studentId: s.id,
                status: selectedRadio.value
            });
        }
    });
    
    return { classId, date, students: studentsData };
}

// Save New
attSaveBtn.addEventListener("click", async () => {
    try {
        const payload = getGridData();
        await requestJson('/api/attendance', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        alert("Attendance saved successfully!");
        attLoadBtn.click(); // Reload to enter edit mode
    } catch (err) {
        alert("Failed to save: " + err.message);
    }
});

// Update Existing
attUpdateBtn.addEventListener("click", async () => {
    if (!currentAttendanceId) return;
    try {
        const payload = getGridData();
        await requestJson(`/api/attendance/${currentAttendanceId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        alert("Attendance updated successfully!");
        attLoadBtn.click(); // Reload
    } catch (err) {
        alert("Failed to update: " + err.message);
    }
});

// Delete
attDeleteBtn.addEventListener("click", async () => {
    if (!currentAttendanceId) return;
    if (!confirm("Are you sure you want to delete the attendance record for this day?")) return;
    
    try {
        await requestJson(`/api/attendance/${currentAttendanceId}`, {
            method: 'DELETE'
        });
        alert("Attendance deleted successfully!");
        attLoadBtn.click(); // Reload (will enter create mode)
    } catch (err) {
        alert("Failed to delete: " + err.message);
    }
});

// Class Report
attReportBtn.addEventListener("click", async () => {
    const classId = attClassSelect.value;
    if (!classId) {
        alert("Please select a class first.");
        return;
    }
    
    try {
        const report = await requestJson(`/api/classes/${classId}/report`);
        
        attReportDays.textContent = report.totalDays;
        attReportStudents.textContent = report.totalStudents;
        
        attReportTableBody.innerHTML = "";
        report.students.forEach(s => {
            const row = document.createElement("tr");
            row.className = "border-b border-slate-200 hover:bg-slate-50";
            
            const pctColor = s.attendancePercentage >= 80 ? 'text-emerald-600' :
                             s.attendancePercentage >= 50 ? 'text-amber-600' : 'text-red-600';
                             
            row.innerHTML = `
                <td class="p-3 font-medium text-slate-900">${s.studentName}</td>
                <td class="p-3 text-center">${s.presentCount}</td>
                <td class="p-3 text-center">${s.absentCount}</td>
                <td class="p-3 text-center">${s.lateCount}</td>
                <td class="p-3 text-center font-bold ${pctColor}">${s.attendancePercentage}%</td>
            `;
            attReportTableBody.appendChild(row);
        });
        attReportContent.classList.remove("hidden");
        currentReportData = report;
        if (attDownloadReportBtn) attDownloadReportBtn.classList.remove("hidden");
    } catch (err) {
        alert("Failed to load report: " + err.message);
    }
});

// Download PDF Data
if (attDownloadReportBtn) {
    attDownloadReportBtn.addEventListener("click", () => {
        if (!currentReportData || !currentReportData.students) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text("Class Attendance Report", 14, 22);
            
            doc.setFontSize(11);
            doc.text(`Class: ${currentReportData.className}`, 14, 30);
            doc.text(`Total Students: ${currentReportData.totalStudents}`, 14, 36);
            doc.text(`Total Days Recorded: ${currentReportData.totalDays}`, 14, 42);

            const tableColumn = ["Student Name", "Present", "Absent", "Late", "Attendance %"];
            const tableRows = [];

            currentReportData.students.forEach(s => {
                tableRows.push([
                    s.studentName,
                    s.presentCount,
                    s.absentCount,
                    s.lateCount,
                    `${s.attendancePercentage}%`
                ]);
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 48,
                theme: 'striped',
                headStyles: { fillColor: [13, 148, 136] } // teal-600
            });

            doc.save(`attendance_report_${currentReportData.className.replace(/\s+/g, '_')}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF. Check console for details.");
        }
    });
}

// Always initialise on load (only populate select once).
// The hashchange listener also handles navigating to the tab later.
function maybeInitAttendance() {
    if (!attendanceInitialised) {
        attendanceInitialised = true;
        initAttendance();
    }
}

window.addEventListener("hashchange", () => {
    if (window.location.hash === "#attendance") {
        maybeInitAttendance();
    }
});

// Run immediately so the class list is ready before the user even clicks the tab
maybeInitAttendance();
