package com.assignment.segroup.service;

import com.assignment.segroup.dto.*;
import com.assignment.segroup.model.*;
import com.assignment.segroup.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;
    private final SchoolClassRepository classRepo;
    private final UserRepository userRepo;

    public AttendanceService(AttendanceRepository attendanceRepo,
                             StudentRepository studentRepo,
                             SchoolClassRepository classRepo,
                             UserRepository userRepo) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
        this.classRepo = classRepo;
        this.userRepo = userRepo;
    }

    public List<AttendanceStudentResponse> getStudentsByClassId(String classId) {
        List<Student> students = studentRepo.findByClassId(classId);
        if (!students.isEmpty()) {
            return students.stream()
                    .map(student -> new AttendanceStudentResponse(student.getId(), student.getName()))
                    .collect(Collectors.toList());
        }
        return userRepo.findByRoleIgnoreCaseAndClassId("student", classId).stream()
                .map(user -> new AttendanceStudentResponse(user.getId(), user.getName()))
                .collect(Collectors.toList());
    }

    public Optional<AttendanceResponse> getAttendance(String classId, LocalDate date) {
        Optional<Attendance> opt = attendanceRepo.findByClassIdAndDate(classId, date);
        if (opt.isEmpty()) return Optional.empty();
        return Optional.of(buildResponse(opt.get()));
    }

    public AttendanceResponse saveAttendance(AttendanceRequest request) {
        if (request.getDate() != null && request.getDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Cannot set attendance for future dates.");
        }
        if (attendanceRepo.existsByClassIdAndDate(request.getClassId(), request.getDate())) {
            throw new RuntimeException("Attendance already exists for this class and date. Use update instead.");
        }
        if (request.getStudents() == null || request.getStudents().isEmpty()) {
            throw new RuntimeException("Student attendance list cannot be empty.");
        }
        for (AttendanceRequest.StudentAttendance sa : request.getStudents()) {
            if (sa.getStatus() == null) {
                throw new RuntimeException("All students must have a status assigned.");
            }
        }

        SchoolClass schoolClass = classRepo.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + request.getClassId()));

        List<AttendanceRecord> records = buildRecords(request.getStudents());
        Attendance attendance = new Attendance(
                request.getClassId(),
                schoolClass.getClassName(),
                request.getDate(),
                records
        );
        attendance = attendanceRepo.save(attendance);
        return buildResponse(attendance);
    }

    public AttendanceResponse updateAttendance(String attendanceId, AttendanceRequest request) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + attendanceId));

        if (attendance.getDate() != null && attendance.getDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Cannot update attendance for future dates.");
        }
        if (request.getStudents() == null || request.getStudents().isEmpty()) {
            throw new RuntimeException("Student attendance list cannot be empty.");
        }
        for (AttendanceRequest.StudentAttendance sa : request.getStudents()) {
            if (sa.getStatus() == null) {
                throw new RuntimeException("All students must have a status assigned.");
            }
        }

        attendance.setRecords(buildRecords(request.getStudents()));
        attendance = attendanceRepo.save(attendance);
        return buildResponse(attendance);
    }

    public void deleteAttendance(String attendanceId) {
        if (!attendanceRepo.existsById(attendanceId)) {
            throw new RuntimeException("Attendance not found with id: " + attendanceId);
        }
        attendanceRepo.deleteById(attendanceId);
    }

    public ClassReportResponse getClassReport(String classId) {
        SchoolClass schoolClass = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));

        List<Student> students = studentRepo.findByClassId(classId);
        List<User> userStudents = Collections.emptyList();
        if (students.isEmpty()) {
            userStudents = userRepo.findByRoleIgnoreCaseAndClassId("student", classId);
        }
        List<Attendance> attendanceList = attendanceRepo.findByClassId(classId);

        int totalDays = attendanceList.size();

        // Build a map: studentId -> list of records
        Map<String, List<AttendanceRecord>> byStudent = new HashMap<>();
        for (Attendance att : attendanceList) {
            if (att.getRecords() == null) continue;
            for (AttendanceRecord rec : att.getRecords()) {
                byStudent.computeIfAbsent(rec.getStudentId(), k -> new ArrayList<>()).add(rec);
            }
        }

        List<ClassReportResponse.StudentSummary> summaries = students.stream().map(s -> {
            List<AttendanceRecord> recs = byStudent.getOrDefault(s.getId(), Collections.emptyList());
            int present = 0, absent = 0, late = 0;
            for (AttendanceRecord r : recs) {
                switch (r.getStatus()) {
                    case PRESENT -> present++;
                    case ABSENT -> absent++;
                    case LATE -> late++;
                }
            }
            double pct = totalDays > 0
                    ? Math.round(((present + late) * 100.0 / totalDays) * 10.0) / 10.0
                    : 0;
            return new ClassReportResponse.StudentSummary(s.getId(), s.getName(), present, absent, late, pct);
        }).collect(Collectors.toCollection(ArrayList::new));

        if (!userStudents.isEmpty()) {
            summaries.addAll(userStudents.stream().map(u -> {
                List<AttendanceRecord> recs = byStudent.getOrDefault(u.getId(), Collections.emptyList());
                int present = 0, absent = 0, late = 0;
                for (AttendanceRecord r : recs) {
                    switch (r.getStatus()) {
                        case PRESENT -> present++;
                        case ABSENT -> absent++;
                        case LATE -> late++;
                    }
                }
                double pct = totalDays > 0
                        ? Math.round(((present + late) * 100.0 / totalDays) * 10.0) / 10.0
                        : 0;
                return new ClassReportResponse.StudentSummary(u.getId(), u.getName(), present, absent, late, pct);
            }).collect(Collectors.toList()));
        }

        ClassReportResponse report = new ClassReportResponse();
        report.setClassId(classId);
        report.setClassName(schoolClass.getClassName());
        report.setTotalDays(totalDays);
        report.setTotalStudents(students.isEmpty() ? userStudents.size() : students.size());
        report.setStudents(summaries);
        return report;
    }

    public List<StudentAttendanceHistory> getStudentHistory(String studentId) {
        List<Attendance> attendanceList = attendanceRepo.findByRecordsStudentId(studentId);
        List<StudentAttendanceHistory> history = new ArrayList<>();

        for (Attendance att : attendanceList) {
            if (att.getRecords() == null) continue;
            att.getRecords().stream()
                    .filter(r -> studentId.equals(r.getStudentId()))
                    .findFirst()
                    .ifPresent(r -> history.add(new StudentAttendanceHistory(
                            att.getId(),
                            att.getDate(),
                            att.getClassName(),
                            r.getStatus()
                    )));
        }

        history.sort(Comparator.comparing(StudentAttendanceHistory::getDate, Comparator.reverseOrder()));
        return history;
    }

    // ── Helpers ──────────────────────────────────────────────────

    private List<AttendanceRecord> buildRecords(List<AttendanceRequest.StudentAttendance> studentList) {
        List<AttendanceRecord> records = new ArrayList<>();
        for (AttendanceRequest.StudentAttendance sa : studentList) {
            Student student = studentRepo.findById(sa.getStudentId()).orElse(null);
            if (student != null) {
                records.add(new AttendanceRecord(student.getId(), student.getName(), sa.getStatus()));
                continue;
            }
            User user = userRepo.findById(sa.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + sa.getStudentId()));
            records.add(new AttendanceRecord(user.getId(), user.getName(), sa.getStatus()));
        }
        return records;
    }

    private AttendanceResponse buildResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setClassId(attendance.getClassId());
        response.setClassName(attendance.getClassName());
        response.setDate(attendance.getDate());
        if (attendance.getRecords() != null) {
            response.setRecords(attendance.getRecords().stream()
                    .map(r -> new AttendanceResponse.StudentRecord(r.getStudentId(), r.getStudentName(), r.getStatus()))
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
