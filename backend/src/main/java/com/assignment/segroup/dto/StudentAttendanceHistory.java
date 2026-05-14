package com.assignment.segroup.dto;

import com.assignment.segroup.model.AttendanceRecord.AttendanceStatus;
import java.time.LocalDate;

public class StudentAttendanceHistory {

    private String attendanceId;
    private LocalDate date;
    private String className;
    private AttendanceStatus status;

    public StudentAttendanceHistory() {}

    public StudentAttendanceHistory(String attendanceId, LocalDate date,
                                    String className, AttendanceStatus status) {
        this.attendanceId = attendanceId;
        this.date = date;
        this.className = className;
        this.status = status;
    }

    public String getAttendanceId() { return attendanceId; }
    public void setAttendanceId(String attendanceId) { this.attendanceId = attendanceId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
}
