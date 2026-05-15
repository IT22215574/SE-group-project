package com.assignment.segroup.controller;

import com.assignment.segroup.model.Notification;
import com.assignment.segroup.model.Result;
import com.assignment.segroup.model.User;
import com.assignment.segroup.repository.NotificationRepository;
import com.assignment.segroup.repository.ResultRepository;
import com.assignment.segroup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // ── CREATE ──────────────────────────────────────────────────────────────────
    @PostMapping
    public Result createResult(@RequestBody Result result) {
        result.setGrade(calculateGrade(result.getMarks()));
        result.setVisible(false);
        return resultRepository.save(result);
    }

    // ── READ (Teacher – all results) ─────────────────────────────────────────
    @GetMapping
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    // ── READ (Teacher – all results for a class) ─────────────────────────────
    @GetMapping("/class/{classID}")
    public List<Result> getResultsByClass(@PathVariable String classID) {
        return resultRepository.findByClassID(classID);
    }

    // ── READ (Student – only published results) ──────────────────────────────
    @GetMapping("/my/{studentID}")
    public List<Result> getMyResults(@PathVariable String studentID) {
        return resultRepository.findByStudentIDAndVisible(studentID, true);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResult(@PathVariable String id,
                                          @RequestBody Result updatedResult) {
        return resultRepository.findById(id).map(result -> {
            result.setStudentID(updatedResult.getStudentID());
            result.setSubject(updatedResult.getSubject());
            result.setMarks(updatedResult.getMarks());
            result.setGrade(calculateGrade(updatedResult.getMarks()));
            return ResponseEntity.ok(resultRepository.save(result));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResult(@PathVariable String id) {
        if (resultRepository.existsById(id)) {
            resultRepository.deleteById(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Result deleted successfully.");
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.notFound().build();
    }

    // ── PUBLISH (marks all visible + notifies students) ──────────────────────
    @PostMapping("/publish")
    public Map<String, String> publishResults(@RequestBody Map<String, String> payload) {
        String classID = payload.get("classID");
        String subject = payload.get("subject");

        List<Result> results = resultRepository.findByClassIDAndSubject(classID, subject);
        for (Result r : results) {
            r.setVisible(true);
        }
        resultRepository.saveAll(results);

        List<User> students;
        if (classID != null && !classID.isEmpty()) {
            students = userRepository.findByRoleAndClassID("student", classID);
        } else {
            students = userRepository.findByRole("student");
        }

        List<Notification> notifications = students.stream().map(student -> {
            Notification n = new Notification();
            n.setRecipientID(student.getId());
            n.setMessage("Results for " + subject + " in class " + classID + " have been published!");
            n.setLink("/student/results");
            return n;
        }).collect(Collectors.toList());

        notificationRepository.saveAll(notifications);

        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Results published! " + notifications.size() + " students notified.");
        return resp;
    }

    // ── HELPER: auto-calculate grade ─────────────────────────────────────────
    private String calculateGrade(int marks) {
        if (marks >= 90) return "A+";
        if (marks >= 80) return "A";
        if (marks >= 70) return "B";
        if (marks >= 60) return "C";
        if (marks >= 50) return "D";
        return "F";
    }
}
