const STUDENT_API_BASE = window.API_BASE || "http://localhost:5001";

async function studentRequestJson(path, options = {}) {
  if (typeof window.requestJson === "function") {
    return window.requestJson(path, options);
  }

  const response = await fetch(`${STUDENT_API_BASE}${path}`, {
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

  if (response.status === 204) return null;
  return response.json();
}

const form = document.getElementById("student-form");
const tableBody = document.getElementById("student-table-body");
const resetBtn = document.getElementById("student-reset");
const searchInput =
  document.getElementById("student-search") ||
  document.getElementById("search");
const searchBtn =
  document.getElementById("student-search-btn") ||
  document.getElementById("search-btn");
const classSelect = document.getElementById("student-class");

function getFormData() {
  return {
    name: document.getElementById("student-name").value.trim(),
    email: document.getElementById("student-email").value.trim(),
    phone: document.getElementById("student-phone").value.trim(),
    classId: classSelect.value,
  };
}

function fillForm(student) {
  document.getElementById("student-id").value = student.id || "";
  document.getElementById("student-name").value = student.name || "";
  document.getElementById("student-email").value = student.email || "";
  document.getElementById("student-phone").value = student.phone || "";

  if (classSelect) {
    classSelect.value = student.classId || "";
  }

  const formCard = document.getElementById("student-form-card");
  if (formCard) {
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function loadClasses() {
  if (!classSelect) return;

  try {
    const classes = await studentRequestJson("/api/admin/classes");
    classSelect.innerHTML = `<option value="">Select class</option>`;

    classes.forEach((cls) => {
      const option = document.createElement("option");
      option.value = cls.id;
      option.textContent = cls.className || `Grade ${cls.grade}`;
      classSelect.appendChild(option);
    });
  } catch (error) {
    classSelect.innerHTML = `<option value="">No classes loaded</option>`;
  }
}

async function loadStudents() {
  if (!tableBody) return;

  const keyword = searchInput ? searchInput.value.trim() : "";
  const url = keyword
    ? `/api/admin/students?keyword=${encodeURIComponent(keyword)}`
    : "/api/admin/students";

  try {
    const students = await studentRequestJson(url);
    tableBody.innerHTML = "";

    if (!students.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="p-4 text-center text-slate-500">
            No student records found.
          </td>
        </tr>
      `;
      return;
    }

    students.forEach((student) => {
      const row = document.createElement("tr");
      row.className = "border-b";

      row.innerHTML = `
        <td class="p-3">${student.name || "-"}</td>
        <td class="p-3">${student.email || "-"}</td>
        <td class="p-3">${student.phone || "-"}</td>
        <td class="p-3">${student.className || "-"}</td>
        <td class="p-3">
          <button type="button" class="edit-btn rounded bg-amber-500 px-3 py-1 text-white">Edit</button>
          <button type="button" class="delete-btn rounded bg-red-600 px-3 py-1 text-white">Delete</button>
        </td>
      `;

      row.querySelector(".edit-btn").addEventListener("click", () => fillForm(student));

      row.querySelector(".delete-btn").addEventListener("click", async () => {
        if (!confirm("Delete this student?")) return;

        try {
          await studentRequestJson(`/api/admin/students/${student.id}`, {
            method: "DELETE",
          });
          await loadStudents();
          alert("Student deleted successfully!");
        } catch (error) {
          alert(`Failed to delete student: ${error.message}`);
        }
      });

      tableBody.appendChild(row);
    });
  } catch (error) {
    alert(`Failed to load students: ${error.message}`);
  }
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("student-id").value.trim();
    const data = getFormData();

    try {
      if (id) {
        await studentRequestJson(`/api/admin/students/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        alert("Student updated successfully!");
      } else {
        await studentRequestJson("/api/admin/students", {
          method: "POST",
          body: JSON.stringify(data),
        });
        alert("Student created successfully!");
      }

      form.reset();
      document.getElementById("student-id").value = "";
      await loadStudents();
    } catch (error) {
      alert(`Failed to save student: ${error.message}`);
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    form.reset();
    document.getElementById("student-id").value = "";
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", loadStudents);
}

if (searchInput) {
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      loadStudents();
    }
  });
}

loadClasses();
loadStudents();

window.addEventListener("classes:updated", loadClasses);