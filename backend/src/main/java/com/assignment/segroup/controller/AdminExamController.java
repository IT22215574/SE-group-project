package com.assignment.segroup.controller;

import com.assignment.segroup.dto.*;
import com.assignment.segroup.model.Exam;
import com.assignment.segroup.model.ExamResult;
import com.assignment.segroup.repository.ExamRepository;
import com.assignment.segroup.repository.ExamResultRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/exams")
public class AdminExamController {

    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;

    public AdminExamController(ExamRepository examRepository,
                                ExamResultRepository examResultRepository) {
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
    }

    // ─── EXAM CRUD ───────────────────────────────────────────

    @GetMapping
    public List<ExamResponse> getAllExams() {
        return examRepository.findAll()
                .stream()
                .sorted((a, b) -> a.getExamName().compareToIgnoreCase(b.getExamName()))
                .map(e -> new ExamResponse(
                        e.getId(), e.getExamName(), e.getSubjectName(),
                        e.getExamDate(), e.getTotalMarks()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponse> getExam(@PathVariable String id) {
        return examRepository.findById(id)
                .map(e -> ResponseEntity.ok(new ExamResponse(
                        e.getId(), e.getExamName(), e.getSubjectName(),
                        e.getExamDate(), e.getTotalMarks())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createExam(@RequestBody ExamRequest req) {
        if (req.getExamName() == null || req.getExamName().isBlank())
            return ResponseEntity.badRequest().body("Exam name is required");
        if (req.getSubjectName() == null || req.getSubjectName().isBlank())
            return ResponseEntity.badRequest().body("Subject name is required");
        if (req.getExamDate() == null || req.getExamDate().isBlank())
            return ResponseEntity.badRequest().body("Exam date is required");
        if (req.getTotalMarks() == null || req.getTotalMarks() < 1)
            return ResponseEntity.badRequest().body("Total marks must be at least 1");

        Exam exam = new Exam();
        exam.setExamName(req.getExamName().trim());
        exam.setSubjectName(req.getSubjectName().trim());
        exam.setExamDate(req.getExamDate());
        exam.setTotalMarks(req.getTotalMarks());

        Exam saved = examRepository.save(exam);
        return ResponseEntity.ok(new ExamResponse(
                saved.getId(), saved.getExamName(), saved.getSubjectName(),
                saved.getExamDate(), saved.getTotalMarks()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(@PathVariable String id,
                                         @RequestBody ExamRequest req) {
        return examRepository.findById(id).map(exam -> {
            if (req.getExamName() != null && !req.getExamName().isBlank())
                exam.setExamName(req.getExamName().trim());
            if (req.getSubjectName() != null && !req.getSubjectName().isBlank())
                exam.setSubjectName(req.getSubjectName().trim());
            if (req.getExamDate() != null && !req.getExamDate().isBlank())
                exam.setExamDate(req.getExamDate());
            if (req.getTotalMarks() != null && req.getTotalMarks() >= 1)
                exam.setTotalMarks(req.getTotalMarks());
            Exam updated = examRepository.save(exam);
            return ResponseEntity.ok(new ExamResponse(
                    updated.getId(), updated.getExamName(), updated.getSubjectName(),
                    updated.getExamDate(), updated.getTotalMarks()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable String id) {
        if (!examRepository.existsById(id))
            return ResponseEntity.notFound().build();
        examResultRepository.deleteByExamId(id);
        examRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── RESULT CRUD ─────────────────────────────────────────

    @GetMapping("/results")
    public List<ExamResultResponse> getAllResults() {
        return examResultRepository.findAll()
                .stream()
                .map(r -> {
                    Exam exam = examRepository.findById(r.getExamId()).orElse(null);
                    String examName = exam != null ? exam.getExamName() : "Unknown";
                    String subjectName = exam != null ? exam.getSubjectName() : "Unknown";
                    Integer totalMarks = exam != null ? exam.getTotalMarks() : 0;
                    return new ExamResultResponse(
                            r.getId(), r.getExamId(), examName, subjectName,
                            r.getStudentName(), r.getMarksObtained(), totalMarks, r.getGrade());
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/results/{id}")
    public ResponseEntity<ExamResultResponse> getResult(@PathVariable String id) {
        return examResultRepository.findById(id).map(r -> {
            Exam exam = examRepository.findById(r.getExamId()).orElse(null);
            String examName = exam != null ? exam.getExamName() : "Unknown";
            String subjectName = exam != null ? exam.getSubjectName() : "Unknown";
            Integer totalMarks = exam != null ? exam.getTotalMarks() : 0;
            return ResponseEntity.ok(new ExamResultResponse(
                    r.getId(), r.getExamId(), examName, subjectName,
                    r.getStudentName(), r.getMarksObtained(), totalMarks, r.getGrade()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/results")
    public ResponseEntity<?> createResult(@RequestBody ExamResultRequest req) {
        if (req.getStudentName() == null || req.getStudentName().isBlank())
            return ResponseEntity.badRequest().body("Student name is required");
        if (req.getExamId() == null || req.getExamId().isBlank())
            return ResponseEntity.badRequest().body("Exam is required");
        if (req.getMarksObtained() == null || req.getMarksObtained() < 0)
            return ResponseEntity.badRequest().body("Marks cannot be negative");

        Exam exam = examRepository.findById(req.getExamId())
                .orElse(null);
        if (exam == null)
            return ResponseEntity.badRequest().body("Exam not found");
        if (req.getMarksObtained() > exam.getTotalMarks())
            return ResponseEntity.badRequest().body(
                    "Marks cannot exceed total marks of " + exam.getTotalMarks());

        ExamResult result = new ExamResult();
        result.setExamId(req.getExamId());
        result.setStudentName(req.getStudentName().trim());
        result.setMarksObtained(req.getMarksObtained());
        result.setGrade(calculateGrade(req.getMarksObtained(), exam.getTotalMarks()));

        ExamResult saved = examResultRepository.save(result);
        return ResponseEntity.ok(new ExamResultResponse(
                saved.getId(), saved.getExamId(), exam.getExamName(),
                exam.getSubjectName(), saved.getStudentName(),
                saved.getMarksObtained(), exam.getTotalMarks(), saved.getGrade()));
    }

    @PutMapping("/results/{id}")
    public ResponseEntity<?> updateResult(@PathVariable String id,
                                           @RequestBody ExamResultRequest req) {
        return examResultRepository.findById(id).map(result -> {
            Exam exam = examRepository.findById(
                    req.getExamId() != null ? req.getExamId() : result.getExamId())
                    .orElse(null);
            if (exam == null)
                return ResponseEntity.badRequest().body("Exam not found");
            if (req.getMarksObtained() != null &&
                req.getMarksObtained() > exam.getTotalMarks())
                return ResponseEntity.badRequest().body(
                        "Marks cannot exceed total marks of " + exam.getTotalMarks());

            if (req.getStudentName() != null && !req.getStudentName().isBlank())
                result.setStudentName(req.getStudentName().trim());
            if (req.getExamId() != null && !req.getExamId().isBlank())
                result.setExamId(req.getExamId());
            if (req.getMarksObtained() != null && req.getMarksObtained() >= 0) {
                result.setMarksObtained(req.getMarksObtained());
                result.setGrade(calculateGrade(req.getMarksObtained(), exam.getTotalMarks()));
            }

            ExamResult updated = examResultRepository.save(result);
            return ResponseEntity.ok(new ExamResultResponse(
                    updated.getId(), updated.getExamId(), exam.getExamName(),
                    exam.getSubjectName(), updated.getStudentName(),
                    updated.getMarksObtained(), exam.getTotalMarks(), updated.getGrade()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/results/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable String id) {
        if (!examResultRepository.existsById(id))
            return ResponseEntity.notFound().build();
        examResultRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── GRADE LOGIC ─────────────────────────────────────────

    private String calculateGrade(int marks, int total) {
        double pct = (marks * 100.0) / total;
        if (pct >= 90) return "A+";
        if (pct >= 75) return "A";
        if (pct >= 65) return "B";
        if (pct >= 55) return "C";
        if (pct >= 40) return "S";
        return "F";
    }
}