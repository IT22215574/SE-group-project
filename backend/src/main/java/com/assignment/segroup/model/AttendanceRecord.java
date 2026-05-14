package com.assignment.segroup.model;

/**
 * Embedded subdocument inside Attendance — not a separate MongoDB collection.
 */
public class AttendanceRecord {

    private String studentId;
    private String studentName;
    private AttendanceStatus status;

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE
    }

    public AttendanceRecord() {}

    public AttendanceRecord(String studentId, String studentName, AttendanceStatus status) {
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
