package com.assignment.segroup.controller;

import com.assignment.segroup.dto.SchoolClassRequest;
import com.assignment.segroup.dto.SchoolClassResponse;
import com.assignment.segroup.dto.SubjectResponse;
import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Subject;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.SubjectRepository;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/classes")
public class AdminClassController {

    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;

    public AdminClassController(SchoolClassRepository schoolClassRepository, SubjectRepository subjectRepository) {
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
    }

    @GetMapping
    public List<SchoolClassResponse> listClasses() {
        return schoolClassRepository.findAll().stream()
                .sorted(Comparator.comparing(SchoolClass::getClassName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public SchoolClassResponse getClassById(@PathVariable Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
        return toResponse(schoolClass);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SchoolClassResponse createClass(@Valid @RequestBody SchoolClassRequest request) {
        SchoolClass schoolClass = new SchoolClass();
        applyRequestToClass(schoolClass, request);
        SchoolClass saved = schoolClassRepository.save(schoolClass);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public SchoolClassResponse updateClass(@PathVariable Long id, @Valid @RequestBody SchoolClassRequest request) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

        applyRequestToClass(schoolClass, request);
        SchoolClass updated = schoolClassRepository.save(schoolClass);
        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClass(@PathVariable Long id) {
        if (!schoolClassRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found");
        }

        schoolClassRepository.deleteById(id);
    }

    private void applyRequestToClass(SchoolClass schoolClass, SchoolClassRequest request) {
        schoolClass.setClassName(request.getClassName().trim());
        schoolClass.setGrade(request.getGrade().trim());
        schoolClass.setAcademicYear(request.getAcademicYear().trim());

        Set<Subject> subjects = new LinkedHashSet<>();
        for (Long subjectId : request.getSubjectIds()) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid subject ID: " + subjectId));
            subjects.add(subject);
        }

        schoolClass.setSubjects(subjects);
    }

    private SchoolClassResponse toResponse(SchoolClass schoolClass) {
        List<SubjectResponse> subjects = schoolClass.getSubjects().stream()
                .sorted(Comparator.comparing(Subject::getName, String.CASE_INSENSITIVE_ORDER))
                .map(subject -> new SubjectResponse(subject.getId(), subject.getName()))
                .toList();

        return new SchoolClassResponse(
                schoolClass.getId(),
                schoolClass.getClassName(),
                schoolClass.getGrade(),
                schoolClass.getAcademicYear(),
                subjects
        );
    }
}
