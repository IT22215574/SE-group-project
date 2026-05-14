package com.assignment.segroup.dto;

import com.assignment.segroup.model.AttendanceRecord.AttendanceStatus;
import java.time.LocalDate;
import java.util.List;

public class AttendanceRequest {

    private String classId;
    private LocalDate date;
    private List<StudentAttendance> students;

    public static class StudentAttendance {
        private String studentId;
        private AttendanceStatus status;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public AttendanceStatus getStatus() { return status; }
        public void setStatus(AttendanceStatus status) { this.status = status; }
    }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<StudentAttendance> getStudents() { return students; }
    public void setStudents(List<StudentAttendance> students) { this.students = students; }
}
