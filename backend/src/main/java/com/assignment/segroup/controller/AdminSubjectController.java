package com.assignment.segroup.controller;

import com.assignment.segroup.dto.SubjectRequest;
import com.assignment.segroup.dto.SubjectResponse;
import com.assignment.segroup.model.Subject;
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
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/subjects")
public class AdminSubjectController {

    private final SubjectRepository subjectRepository;

    public AdminSubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @GetMapping
    public List<SubjectResponse> listSubjects() {
        return subjectRepository.findAll().stream()
                .sorted(Comparator.comparing(Subject::getName, String.CASE_INSENSITIVE_ORDER))
                .map(subject -> new SubjectResponse(subject.getId(), subject.getName()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubjectResponse createSubject(@Valid @RequestBody SubjectRequest request) {
        if (subjectRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Subject already exists");
        }

        Subject subject = new Subject(request.getName().trim());
        Subject saved = subjectRepository.save(subject);
        return new SubjectResponse(saved.getId(), saved.getName());
    }

    @PutMapping("/{id}")
    public SubjectResponse updateSubject(@PathVariable String id, @Valid @RequestBody SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));

        String updatedName = request.getName().trim();
        if (!subject.getName().equalsIgnoreCase(updatedName) && subjectRepository.existsByNameIgnoreCase(updatedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Subject already exists");
        }

        subject.setName(updatedName);
        Subject updated = subjectRepository.save(subject);
        return new SubjectResponse(updated.getId(), updated.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSubject(@PathVariable String id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found");
        }

        subjectRepository.deleteById(id);
    }
}
