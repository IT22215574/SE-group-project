package com.assignment.segroup.controller;

import com.assignment.segroup.dto.StudentRequest;
import com.assignment.segroup.dto.StudentResponse;
import com.assignment.segroup.dto.StudentStatsResponse;
import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Student;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "INACTIVE", "TRANSFERRED", "GRADUATED");

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    public AdminStudentController(StudentRepository studentRepository, SchoolClassRepository schoolClassRepository) {
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @GetMapping
    public List<StudentResponse> listStudents(@RequestParam(required = false) String keyword,
                                              @RequestParam(required = false) String grade,
                                              @RequestParam(required = false) String status,
                                              @RequestParam(required = false) String classId) {
        String normalizedKeyword = normalize(keyword).toLowerCase(Locale.ROOT);
        String normalizedGrade = normalize(grade);
        String normalizedStatus = normalize(status).toUpperCase(Locale.ROOT);
        String normalizedClassId = normalize(classId);

        return studentRepository.findAll().stream()
                .filter(student -> matchesKeyword(student, normalizedKeyword))
                .filter(student -> normalizedGrade.isBlank() || normalize(student.getGrade()).equalsIgnoreCase(normalizedGrade))
                .filter(student -> normalizedStatus.isBlank() || normalize(student.getStatus()).equalsIgnoreCase(normalizedStatus))
                .filter(student -> normalizedClassId.isBlank() || normalize(student.getClassId()).equals(normalizedClassId))
                .sorted(Comparator.comparing(Student::getAdmissionNo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/stats")
    public StudentStatsResponse getStats() {
        List<Student> students = studentRepository.findAll();
        return new StudentStatsResponse(
                students.size(),
                countByStatus(students, "ACTIVE"),
                countByStatus(students, "INACTIVE"),
                countByStatus(students, "TRANSFERRED"),
                countByStatus(students, "GRADUATED")
        );
    }

    @GetMapping("/{id}")
    public StudentResponse getStudentById(@PathVariable String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        return toResponse(student);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse createStudent(@Valid @RequestBody StudentRequest request) {
        String admissionNo = normalize(request.getAdmissionNo()).toUpperCase(Locale.ROOT);
        if (studentRepository.existsByAdmissionNoIgnoreCase(admissionNo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Admission number already exists");
        }

        Student student = new Student();
        student.setCreatedAt(Instant.now());
        applyRequestToStudent(student, request);
        Student saved = studentRepository.save(student);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public StudentResponse updateStudent(@PathVariable String id, @Valid @RequestBody StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        String admissionNo = normalize(request.getAdmissionNo()).toUpperCase(Locale.ROOT);
        studentRepository.findByAdmissionNoIgnoreCase(admissionNo).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Admission number already exists");
            }
        });

        applyRequestToStudent(student, request);
        Student updated = studentRepository.save(student);
        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable String id) {
        if (!studentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        studentRepository.deleteById(id);
    }

    private void applyRequestToStudent(Student student, StudentRequest request) {
        String status = normalize(request.getStatus()).toUpperCase(Locale.ROOT);
        if (!VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid student status");
        }

        String classId = normalize(request.getClassId());
        String className = normalize(request.getClassName());
        String grade = normalize(request.getGrade());

        if (!classId.isBlank()) {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid class ID"));
            className = schoolClass.getClassName();
            if (grade.isBlank()) {
                grade = schoolClass.getGrade();
            }
        }

        student.setAdmissionNo(normalize(request.getAdmissionNo()).toUpperCase(Locale.ROOT));
        student.setFirstName(normalizeName(request.getFirstName()));
        student.setLastName(normalizeName(request.getLastName()));
        student.setEmail(normalize(request.getEmail()).toLowerCase(Locale.ROOT));
        student.setPhone(normalize(request.getPhone()));
        student.setGender(normalizeName(request.getGender()));
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGrade(grade);
        student.setClassId(classId.isBlank() ? null : classId);
        student.setClassName(className.isBlank() ? null : className);
        student.setGuardianName(normalizeName(request.getGuardianName()));
        student.setGuardianPhone(normalize(request.getGuardianPhone()));
        student.setGuardianEmail(normalize(request.getGuardianEmail()).toLowerCase(Locale.ROOT));
        student.setAddress(normalize(request.getAddress()));
        student.setEnrollmentDate(request.getEnrollmentDate() == null ? LocalDate.now() : request.getEnrollmentDate());
        student.setStatus(status);
        student.setNotes(normalize(request.getNotes()));
        student.setUpdatedAt(Instant.now());
    }

    private StudentResponse toResponse(Student student) {
        String fullName = (normalize(student.getFirstName()) + " " + normalize(student.getLastName())).trim();
        return new StudentResponse(
                student.getId(),
                student.getAdmissionNo(),
                student.getFirstName(),
                student.getLastName(),
                fullName,
                student.getEmail(),
                student.getPhone(),
                student.getGender(),
                student.getDateOfBirth(),
                student.getGrade(),
                student.getClassId(),
                student.getClassName(),
                student.getGuardianName(),
                student.getGuardianPhone(),
                student.getGuardianEmail(),
                student.getAddress(),
                student.getEnrollmentDate(),
                student.getStatus(),
                student.getNotes(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }

    private boolean matchesKeyword(Student student, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String searchable = String.join(" ",
                normalize(student.getAdmissionNo()),
                normalize(student.getFirstName()),
                normalize(student.getLastName()),
                normalize(student.getEmail()),
                normalize(student.getGuardianName()),
                normalize(student.getGuardianPhone()),
                normalize(student.getClassName())
        ).toLowerCase(Locale.ROOT);
        return searchable.contains(keyword);
    }

    private long countByStatus(List<Student> students, String status) {
        return students.stream()
                .filter(student -> normalize(student.getStatus()).equalsIgnoreCase(status))
                .count();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeName(String value) {
        String normalized = normalize(value);
        if (normalized.isBlank()) {
            return normalized;
        }
        String[] words = normalized.toLowerCase(Locale.ROOT).split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
        }
        return builder.toString();
    }
}
