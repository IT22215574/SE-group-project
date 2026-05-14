package com.assignment.segroup.controller;

import com.assignment.segroup.dto.*;
import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Student;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.StudentRepository;
import com.assignment.segroup.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final SchoolClassRepository classRepo;
    private final StudentRepository studentRepo;

    public AttendanceController(AttendanceService attendanceService,
                                SchoolClassRepository classRepo,
                                StudentRepository studentRepo) {
        this.attendanceService = attendanceService;
        this.classRepo = classRepo;
        this.studentRepo = studentRepo;
    }

    // ── Get all classes ──────────────────────────────────────────
    @GetMapping("/classes")
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        return ResponseEntity.ok(classRepo.findAll());
    }

    // ── Get students by class ────────────────────────────────────
    @GetMapping("/classes/{id}/students")
    public ResponseEntity<List<Student>> getStudentsByClass(@PathVariable("id") String id) {
        return ResponseEntity.ok(attendanceService.getStudentsByClassId(id));
    }

    // ── Get a single student ─────────────────────────────────────
    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudent(@PathVariable("id") String id) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        }
        return ResponseEntity.notFound().build();
    }

    // ── Get attendance by class + date ───────────────────────────
    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(
            @RequestParam("classId") String classId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Optional<AttendanceResponse> response = attendanceService.getAttendance(classId, date);
        if (response.isPresent()) {
            return ResponseEntity.ok(response.get());
        }
        return ResponseEntity.ok(Map.of("exists", false));
    }

    // ── Create attendance ────────────────────────────────────────
    @PostMapping("/attendance")
    public ResponseEntity<?> createAttendance(@RequestBody AttendanceRequest request) {
        try {
            AttendanceResponse response = attendanceService.saveAttendance(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Update attendance ────────────────────────────────────────
    @PutMapping("/attendance/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable("id") String id,
                                              @RequestBody AttendanceRequest request) {
        try {
            AttendanceResponse response = attendanceService.updateAttendance(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Delete attendance ────────────────────────────────────────
    @DeleteMapping("/attendance/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable("id") String id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.ok(Map.of("message", "Attendance deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Class Attendance Report ──────────────────────────────────
    @GetMapping("/classes/{id}/report")
    public ResponseEntity<?> getClassReport(@PathVariable("id") String id) {
        try {
            ClassReportResponse report = attendanceService.getClassReport(id);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Student Attendance History ────────────────────────────────
    @GetMapping("/students/{id}/attendance")
    public ResponseEntity<?> getStudentHistory(@PathVariable("id") String id) {
        try {
            List<StudentAttendanceHistory> history = attendanceService.getStudentHistory(id);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
