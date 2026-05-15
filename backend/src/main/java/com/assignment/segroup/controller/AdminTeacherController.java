package com.assignment.segroup.controller;

import com.assignment.segroup.dto.TeacherRequest;
import com.assignment.segroup.dto.TeacherResponse;
import com.assignment.segroup.dto.TeacherStatsResponse;
import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Subject;
import com.assignment.segroup.model.Teacher;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.SubjectRepository;
import com.assignment.segroup.repository.TeacherRepository;
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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/teachers")
public class AdminTeacherController {

    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "INACTIVE", "ON_LEAVE");

    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;

    public AdminTeacherController(TeacherRepository teacherRepository,
                                  SubjectRepository subjectRepository,
                                  SchoolClassRepository schoolClassRepository) {
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @GetMapping
    public List<TeacherResponse> listTeachers(@RequestParam(required = false) String keyword,
                                              @RequestParam(required = false) String subjectId,
                                              @RequestParam(required = false) String classId,
                                              @RequestParam(required = false) String status) {
        String normalizedKeyword = normalize(keyword).toLowerCase(Locale.ROOT);
        String normalizedSubjectId = normalize(subjectId);
        String normalizedClassId = normalize(classId);
        String normalizedStatus = normalize(status).toUpperCase(Locale.ROOT);

        return teacherRepository.findAll().stream()
                .filter(teacher -> matchesKeyword(teacher, normalizedKeyword))
                .filter(teacher -> normalizedSubjectId.isBlank() || normalize(teacher.getSubjectId()).equals(normalizedSubjectId))
                .filter(teacher -> normalizedClassId.isBlank() || normalize(teacher.getClassId()).equals(normalizedClassId))
                .filter(teacher -> normalizedStatus.isBlank() || normalize(teacher.getStatus()).equalsIgnoreCase(normalizedStatus))
                .sorted(Comparator.comparing(this::teacherSortName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/stats")
    public TeacherStatsResponse getStats() {
        List<Teacher> teachers = teacherRepository.findAll();
        return new TeacherStatsResponse(
                teachers.size(),
                countByStatus(teachers, "ACTIVE"),
                countByStatus(teachers, "INACTIVE"),
                countByStatus(teachers, "ON_LEAVE")
        );
    }

    @GetMapping("/{id}")
    public TeacherResponse getTeacherById(@PathVariable String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));
        return toResponse(teacher);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherResponse createTeacher(@Valid @RequestBody TeacherRequest request) {
        String teacherId = normalize(request.getTeacherId()).toUpperCase(Locale.ROOT);
        if (teacherRepository.existsByTeacherIdIgnoreCase(teacherId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher ID already exists");
        }

        String email = normalize(request.getEmail()).toLowerCase(Locale.ROOT);
        if (!email.isBlank() && teacherRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher email already exists");
        }

        Teacher teacher = new Teacher();
        teacher.setCreatedAt(Instant.now());
        applyRequestToTeacher(teacher, request);
        Teacher saved = teacherRepository.save(teacher);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public TeacherResponse updateTeacher(@PathVariable String id, @Valid @RequestBody TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        String teacherId = normalize(request.getTeacherId()).toUpperCase(Locale.ROOT);
        teacherRepository.findByTeacherIdIgnoreCase(teacherId).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher ID already exists");
            }
        });

        String email = normalize(request.getEmail()).toLowerCase(Locale.ROOT);
        if (!email.isBlank()) {
            teacherRepository.findByEmailIgnoreCase(email).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher email already exists");
                }
            });
        }

        applyRequestToTeacher(teacher, request);
        Teacher updated = teacherRepository.save(teacher);
        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTeacher(@PathVariable String id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found");
        }
        teacherRepository.deleteById(id);
    }

    private void applyRequestToTeacher(Teacher teacher, TeacherRequest request) {
        String status = normalize(request.getStatus()).toUpperCase(Locale.ROOT);
        if (!VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid teacher status");
        }

        String subjectId = normalize(request.getSubjectId());
        String subjectName = normalize(request.getSubjectName());
        if (!subjectId.isBlank()) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid subject ID"));
            subjectName = subject.getName();
        }

        String classId = normalize(request.getClassId());
        String className = normalize(request.getClassName());
        if (!classId.isBlank()) {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid class ID"));
            className = schoolClass.getClassName();
        }

        teacher.setTeacherId(normalize(request.getTeacherId()).toUpperCase(Locale.ROOT));
        teacher.setFirstName(normalizeName(request.getFirstName()));
        teacher.setLastName(normalizeName(request.getLastName()));
        teacher.setEmail(normalize(request.getEmail()).toLowerCase(Locale.ROOT));
        teacher.setPhone(normalize(request.getPhone()));
        teacher.setGender(normalizeName(request.getGender()));
        teacher.setSubjectId(subjectId.isBlank() ? null : subjectId);
        teacher.setSubjectName(subjectName.isBlank() ? null : subjectName);
        teacher.setClassId(classId.isBlank() ? null : classId);
        teacher.setClassName(className.isBlank() ? null : className);
        teacher.setQualification(normalize(request.getQualification()));
        teacher.setStatus(status);
        teacher.setUpdatedAt(Instant.now());
    }

    private TeacherResponse toResponse(Teacher teacher) {
        String firstName = normalize(teacher.getFirstName());
        String lastName = normalize(teacher.getLastName());
        String fullName = (firstName + " " + lastName).trim();
        if (fullName.isBlank()) {
            fullName = normalize(teacher.getName());
        }

        return new TeacherResponse(
                teacher.getId(),
                teacher.getTeacherId(),
                teacher.getFirstName(),
                teacher.getLastName(),
                fullName,
                teacher.getEmail(),
                teacher.getPhone(),
                teacher.getGender(),
                teacher.getSubjectId(),
                firstNonBlank(teacher.getSubjectName(), teacher.getSubject()),
                teacher.getClassId(),
                teacher.getClassName(),
                teacher.getQualification(),
                normalize(teacher.getStatus()).isBlank() ? "ACTIVE" : teacher.getStatus(),
                teacher.getCreatedAt(),
                teacher.getUpdatedAt()
        );
    }

    private boolean matchesKeyword(Teacher teacher, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String searchable = String.join(" ",
                normalize(teacher.getTeacherId()),
                normalize(teacher.getFirstName()),
                normalize(teacher.getLastName()),
                normalize(teacher.getName()),
                normalize(teacher.getEmail()),
                normalize(teacher.getPhone()),
                normalize(teacher.getSubjectName()),
                normalize(teacher.getSubject()),
                normalize(teacher.getClassName()),
                normalize(teacher.getQualification())
        ).toLowerCase(Locale.ROOT);
        return searchable.contains(keyword);
    }

    private long countByStatus(List<Teacher> teachers, String status) {
        return teachers.stream()
                .filter(teacher -> normalize(teacher.getStatus()).equalsIgnoreCase(status))
                .count();
    }

    private String teacherSortName(Teacher teacher) {
        String fullName = (normalize(teacher.getFirstName()) + " " + normalize(teacher.getLastName())).trim();
        return fullName.isBlank() ? normalize(teacher.getName()) : fullName;
    }

    private String firstNonBlank(String primary, String fallback) {
        String normalizedPrimary = normalize(primary);
        return normalizedPrimary.isBlank() ? normalize(fallback) : normalizedPrimary;
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
