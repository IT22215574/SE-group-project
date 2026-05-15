package com.assignment.segroup.controller;

import com.assignment.segroup.dto.StudentRequest;
import com.assignment.segroup.dto.StudentResponse;
import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Student;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    public AdminStudentController(StudentRepository studentRepository,
                                  SchoolClassRepository schoolClassRepository) {
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @GetMapping
    public List<StudentResponse> listStudents(@RequestParam(required = false) String keyword,
                                              @RequestParam(required = false) String classId) {

        String search = normalize(keyword).toLowerCase(Locale.ROOT);
        String selectedClassId = normalize(classId);

        return studentRepository.findAll().stream()
                .filter(student -> matchesKeyword(student, search))
                .filter(student -> selectedClassId.isBlank()
                        || normalize(student.getClassId()).equals(selectedClassId))
                .sorted(Comparator.comparing(Student::getName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(this::toResponse)
                .toList();
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
        Student student = new Student();
        student.setCreatedAt(Instant.now());

        applyRequestToStudent(student, request);

        Student saved = studentRepository.save(student);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public StudentResponse updateStudent(@PathVariable String id,
                                         @Valid @RequestBody StudentRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

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
        String classId = normalize(request.getClassId());
        String className = normalize(request.getClassName());

        if (!classId.isBlank()) {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid class ID"));

            className = schoolClass.getClassName();
        }

        student.setName(normalizeName(request.getName()));
        student.setEmail(normalize(request.getEmail()).toLowerCase(Locale.ROOT));
        student.setPhone(normalize(request.getPhone()));
        student.setClassId(classId.isBlank() ? null : classId);
        student.setClassName(className.isBlank() ? null : className);
        student.setUpdatedAt(Instant.now());
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getPhone(),
                student.getClassId(),
                student.getClassName(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }

    private boolean matchesKeyword(Student student, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String searchable = String.join(" ",
                normalize(student.getName()),
                normalize(student.getEmail()),
                normalize(student.getPhone()),
                normalize(student.getClassName())
        ).toLowerCase(Locale.ROOT);

        return searchable.contains(keyword);
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
            builder.append(Character.toUpperCase(word.charAt(0)))
                    .append(word.substring(1));
        }

        return builder.toString();
    }
}