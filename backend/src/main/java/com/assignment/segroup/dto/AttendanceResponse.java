package com.assignment.segroup.dto;

import com.assignment.segroup.model.AttendanceRecord.AttendanceStatus;
import java.time.LocalDate;
import java.util.List;

public class AttendanceResponse {

    private String id;
    private String classId;
    private String className;
    private LocalDate date;
    private List<StudentRecord> records;

    public static class StudentRecord {
        private String studentId;
        private String studentName;
        private AttendanceStatus status;

        public StudentRecord() {}

        public StudentRecord(String studentId, String studentName, AttendanceStatus status) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.status = status;
        }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public AttendanceStatus getStatus() { return status; }
        public void setStatus(AttendanceStatus status) { this.status = status; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<StudentRecord> getRecords() { return records; }
    public void setRecords(List<StudentRecord> records) { this.records = records; }
}
