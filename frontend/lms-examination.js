// lms-examination.js — Examination & Results Module
// Follows the same pattern as lms-class-management.js

let exams = [];
let examResults = [];

const examForm = document.getElementById("exam-form");
const examIdInput = document.getElementById("exam-id");
const examNameInput = document.getElementById("exam-name");
const examSubjectInput = document.getElementById("exam-subject");
const examDateInput = document.getElementById("exam-date");
const examTotalMarksInput = document.getElementById("exam-total-marks");
const examResetButton = document.getElementById("exam-reset");
const examTableBody = document.getElementById("exam-table-body");

const resultForm = document.getElementById("result-form");
const resultIdInput = document.getElementById("result-id");
const resultStudentInput = document.getElementById("result-student");
const resultExamSelect = document.getElementById("result-exam");
const resultMarksInput = document.getElementById("result-marks");
const resultMarksHint = document.getElementById("result-marks-hint");
const resultGradePreview = document.getElementById("result-grade-preview");
const resultResetButton = document.getElementById("result-reset");
const resultTableBody = document.getElementById("result-table-body");

const examsNavLink = document.querySelector('a.lms-nav-link[href="#exams"]');
const examsSection = document.getElementById("exams");

// Add exams section to page routing
if (examsSection) {
    pageSections["exams"] = examsSection;
}

// Hide exams nav for non-admin (matches their pattern)
if (currentRole !== "admin") {
    if (examsNavLink) examsNavLink.classList.add("hidden");
}

// Update allowed pages for admin
const originalSyncPage = window.addEventListener;

// ─── GRADE CALCULATION ───────────────────────────────────────

function calculateGrade(marks, total) {
    const pct = (marks / total) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 75) return "A";
    if (pct >= 65) return "B";
    if (pct >= 55) return "C";
    if (pct >= 40) return "S";
    return "F";
}

function gradeColor(grade) {
    const colors = {
        "A+": "bg-emerald-100 text-emerald-800",
        "A":  "bg-blue-100 text-blue-800",
        "B":  "bg-violet-100 text-violet-800",
        "C":  "bg-yellow-100 text-yellow-800",
        "S":  "bg-orange-100 text-orange-800",
        "F":  "bg-red-100 text-red-800"
    };
    return colors[grade] || "bg-slate-100 text-slate-800";
}

// ─── RENDER FUNCTIONS ────────────────────────────────────────

function renderExams() {
    examTableBody.innerHTML = "";
    if (exams.length === 0) {
        examTableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No exams found.</td></tr>`;
        return;
    }
    exams.forEach(exam => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        row.innerHTML = `
            <td class="p-3 font-medium">${exam.examName}</td>
            <td class="p-3 text-slate-600">${exam.subjectName}</td>
            <td class="p-3 text-slate-600">${exam.examDate}</td>
            <td class="p-3 text-slate-600">${exam.totalMarks}</td>
            <td class="p-3"></td>
        `;
        const actionsCell = row.querySelector("td:last-child");

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
            examIdInput.value = exam.id;
            examNameInput.value = exam.examName;
            examSubjectInput.value = exam.subjectName;
            examDateInput.value = exam.examDate;
            examTotalMarksInput.value = exam.totalMarks;
            window.location.hash = "#exams";
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "rounded-lg bg-red-600 px-3 py-1 text-xs text-white";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async () => {
            if (!window.confirm(`Delete exam "${exam.examName}"? All results will also be deleted.`)) return;
            try {
                await requestJson(`/api/admin/exams/${exam.id}`, { method: "DELETE" });
                await refreshExams();
                window.alert("Exam deleted successfully!");
            } catch (error) {
                window.alert(`Failed to delete exam: ${error.message}`);
            }
        });

        actionsCell.append(editBtn, deleteBtn);
        examTableBody.appendChild(row);
    });

    // Update exam dropdown in result form
    resultExamSelect.innerHTML = '<option value="">-- Select an Exam --</option>';
    exams.forEach(exam => {
        const option = document.createElement("option");
        option.value = exam.id;
        option.textContent = `${exam.examName} (${exam.subjectName}) — ${exam.totalMarks} marks`;
        resultExamSelect.appendChild(option);
    });
}

function renderResults() {
    resultTableBody.innerHTML = "";
    if (examResults.length === 0) {
        resultTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">No results found.</td></tr>`;
        return;
    }
    examResults.forEach(result => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-200";
        row.innerHTML = `
            <td class="p-3 font-medium">${result.studentName}</td>
            <td class="p-3 text-slate-600">${result.examName}</td>
            <td class="p-3 text-slate-600">${result.subjectName}</td>
            <td class="p-3 text-slate-600">${result.marksObtained}/${result.totalMarks}</td>
            <td class="p-3">
                <span class="rounded-full px-2 py-1 text-xs font-semibold ${gradeColor(result.grade)}">${result.grade}</span>
            </td>
            <td class="p-3"></td>
        `;
        const actionsCell = row.querySelector("td:last-child");

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "mr-2 rounded-lg border border-slate-300 px-3 py-1 text-xs";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
            resultIdInput.value = result.id;
            resultStudentInput.value = result.studentName;
            resultExamSelect.value = result.examId;
            resultMarksInput.value = result.marksObtained;
            updateMarksHint();
            updateGradePreview();
            window.location.hash = "#exams";
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "rounded-lg bg-red-600 px-3 py-1 text-xs text-white";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async () => {
            if (!window.confirm(`Delete result for "${result.studentName}"?`)) return;
            try {
                await requestJson(`/api/admin/exams/results/${result.id}`, { method: "DELETE" });
                await refreshResults();
                window.alert("Result deleted successfully!");
            } catch (error) {
                window.alert(`Failed to delete result: ${error.message}`);
            }
        });

        actionsCell.append(editBtn, deleteBtn);
        resultTableBody.appendChild(row);
    });
}

// ─── LIVE GRADE PREVIEW ──────────────────────────────────────

function updateMarksHint() {
    const examId = resultExamSelect.value;
    const exam = exams.find(e => e.id === examId);
    resultMarksHint.textContent = exam ? `Max marks: ${exam.totalMarks}` : "";
    resultMarksInput.max = exam ? exam.totalMarks : "";
}

function updateGradePreview() {
    const marks = parseInt(resultMarksInput.value);
    const examId = resultExamSelect.value;
    const exam = exams.find(e => e.id === examId);
    if (exam && !isNaN(marks) && marks >= 0) {
        const grade = calculateGrade(marks, exam.totalMarks);
        resultGradePreview.innerHTML = `
            <span class="rounded-full px-3 py-1 text-sm font-bold ${gradeColor(grade)}">${grade}</span>
        `;
    } else {
        resultGradePreview.textContent = "Grade will appear after entering marks";
        resultGradePreview.className = "mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-500";
    }
}

resultExamSelect.addEventListener("change", () => {
    updateMarksHint();
    updateGradePreview();
});

resultMarksInput.addEventListener("input", updateGradePreview);

// ─── REFRESH DATA ────────────────────────────────────────────

async function refreshExams() {
    exams = await requestJson("/api/admin/exams");
    renderExams();
}

async function refreshResults() {
    examResults = await requestJson("/api/admin/exams/results");
    renderResults();
}

async function refreshAllExamData() {
    await refreshExams();
    await refreshResults();
}

// ─── FORM SUBMIT — EXAM ──────────────────────────────────────

examForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = examIdInput.value.trim();
    const examName = examNameInput.value.trim();
    const subjectName = examSubjectInput.value.trim();
    const examDate = examDateInput.value;
    const totalMarks = parseInt(examTotalMarksInput.value);

    if (!examName || !subjectName || !examDate || !totalMarks) {
        window.alert("All fields are required.");
        return;
    }

    if (totalMarks < 1) {
        window.alert("Total marks must be at least 1.");
        return;
    }

    const payload = { examName, subjectName, examDate, totalMarks };

    try {
        if (id) {
            await requestJson(`/api/admin/exams/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Exam updated successfully!");
        } else {
            await requestJson("/api/admin/exams", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("Exam created successfully!");
        }
        resetExamForm();
        await refreshExams();
    } catch (error) {
        window.alert(`Failed to save exam: ${error.message}`);
    }
});

// ─── FORM SUBMIT — RESULT ────────────────────────────────────

resultForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = resultIdInput.value.trim();
    const studentName = resultStudentInput.value.trim();
    const examId = resultExamSelect.value;
    const marksObtained = parseInt(resultMarksInput.value);
    const exam = exams.find(e => e.id === examId);

    if (!studentName) {
        window.alert("Student name is required.");
        return;
    }
    if (!examId) {
        window.alert("Please select an exam.");
        return;
    }
    if (isNaN(marksObtained) || marksObtained < 0) {
        window.alert("Marks cannot be negative.");
        return;
    }
    if (exam && marksObtained > exam.totalMarks) {
        window.alert(`Marks cannot exceed ${exam.totalMarks}.`);
        return;
    }

    const payload = { studentName, examId, marksObtained };

    try {
        if (id) {
            await requestJson(`/api/admin/exams/results/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            window.alert("Result updated successfully!");
        } else {
            await requestJson("/api/admin/exams/results", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            window.alert("Result created successfully!");
        }
        resetResultForm();
        await refreshResults();
    } catch (error) {
        window.alert(`Failed to save result: ${error.message}`);
    }
});

// ─── RESET FORMS ─────────────────────────────────────────────

function resetExamForm() {
    examIdInput.value = "";
    examNameInput.value = "";
    examSubjectInput.value = "";
    examDateInput.value = "";
    examTotalMarksInput.value = "";
}

function resetResultForm() {
    resultIdInput.value = "";
    resultStudentInput.value = "";
    resultExamSelect.value = "";
    resultMarksInput.value = "";
    resultMarksHint.textContent = "";
    resultGradePreview.textContent = "Grade will appear after entering marks";
}

examResetButton.addEventListener("click", resetExamForm);
resultResetButton.addEventListener("click", resetResultForm);

// ─── INIT ────────────────────────────────────────────────────

refreshAllExamData().catch(error => {
    window.alert(`Failed to load examination data: ${error.message}`);
});