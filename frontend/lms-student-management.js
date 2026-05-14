// Relies on API_BASE and requestJson from lms-class-management.js

const form = document.getElementById("student-form");
const tableBody = document.getElementById("student-table-body");
const resetBtn = document.getElementById("student-reset");
const searchInput = document.getElementById("search") || document.createElement("input"); // prevent crashes
const searchBtn = document.getElementById("search-btn") || document.createElement("button"); // prevent crashes
const classSelect = document.getElementById("student-class");
function getFormData() {
  return {
    admissionNo: document.getElementById("admission-no").value.trim(),
    firstName: document.getElementById("first-name").value.trim(),
    lastName: document.getElementById("last-name").value.trim(),
    gender: document.getElementById("gender").value,
    dateOfBirth: document.getElementById("date-of-birth").value || null,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    grade: document.getElementById("grade").value.trim(),
    classId: classSelect.value,
    guardianName: document.getElementById("guardian-name").value.trim(),
    guardianPhone: document.getElementById("guardian-phone").value.trim(),
    guardianEmail: document.getElementById("guardian-email").value.trim(),
    address: document.getElementById("address").value.trim(),
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value.trim()
  };
}

function fillForm(student) {
  document.getElementById("student-id").value = student.id || "";
  document.getElementById("admission-no").value = student.admissionNo || "";
  document.getElementById("first-name").value = student.firstName || "";
  document.getElementById("last-name").value = student.lastName || "";
  document.getElementById("gender").value = student.gender || "";
  document.getElementById("date-of-birth").value = student.dateOfBirth || "";
  document.getElementById("email").value = student.email || "";
  document.getElementById("phone").value = student.phone || "";
  document.getElementById("grade").value = student.grade || "";
  classSelect.value = student.classId || "";
  document.getElementById("guardian-name").value = student.guardianName || "";
  document.getElementById("guardian-phone").value = student.guardianPhone || "";
  document.getElementById("guardian-email").value = student.guardianEmail || "";
  document.getElementById("address").value = student.address || "";
  document.getElementById("status").value = student.status || "ACTIVE";
  document.getElementById("notes").value = student.notes || "";
}

async function loadClasses() {
  try {
    const classes = await requestJson("/api/admin/classes");
    classSelect.innerHTML = `<option value="">Select Class</option>`;

    classes.forEach(cls => {
      const option = document.createElement("option");
      option.value = cls.id;
      option.textContent = `${cls.className} - Grade ${cls.grade}`;
      classSelect.appendChild(option);
    });
  } catch {
    classSelect.innerHTML = `<option value="">No classes loaded</option>`;
  }
}

async function loadStudents() {
  const keyword = searchInput.value.trim();
  const url = keyword ? `/api/admin/students?keyword=${encodeURIComponent(keyword)}` : "/api/admin/students";

  const students = await requestJson(url);
  tableBody.innerHTML = "";

  students.forEach(student => {
    const row = document.createElement("tr");
    row.className = "border-b";

    row.innerHTML = `
      <td class="p-3">${student.admissionNo || "-"}</td>
      <td class="p-3">${student.fullName || "-"}</td>
      <td class="p-3">${student.grade || "-"}</td>
      <td class="p-3">${student.className || "-"}</td>
      <td class="p-3">${student.status || "-"}</td>
      <td class="p-3">
        <button class="edit-btn rounded bg-amber-500 px-3 py-1 text-white">Edit</button>
        <button class="delete-btn rounded bg-red-600 px-3 py-1 text-white">Delete</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => fillForm(student));
    row.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("Delete this student?")) {
        await requestJson(`/api/admin/students/${student.id}`, { method: "DELETE" });
        await loadStudents();
      }
    });

    tableBody.appendChild(row);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("student-id").value;
  const data = getFormData();

  if (id) {
    await requestJson(`/api/admin/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  } else {
    await requestJson("/api/admin/students", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  form.reset();
  document.getElementById("student-id").value = "";
  await loadStudents();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  document.getElementById("student-id").value = "";
});

searchBtn.addEventListener("click", loadStudents);

loadClasses();
loadStudents();