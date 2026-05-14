package com.assignment.segroup.dto;

import java.util.List;

public class ClassReportResponse {

    private String classId;
    private String className;
    private int totalDays;
    private int totalStudents;
    private List<StudentSummary> students;

    public static class StudentSummary {
        private String studentId;
        private String studentName;
        private int presentCount;
        private int absentCount;
        private int lateCount;
        private double attendancePercentage;

        public StudentSummary() {}

        public StudentSummary(String studentId, String studentName,
                              int presentCount, int absentCount, int lateCount,
                              double attendancePercentage) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.presentCount = presentCount;
            this.absentCount = absentCount;
            this.lateCount = lateCount;
            this.attendancePercentage = attendancePercentage;
        }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public int getPresentCount() { return presentCount; }
        public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

        public int getAbsentCount() { return absentCount; }
        public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

        public int getLateCount() { return lateCount; }
        public void setLateCount(int lateCount) { this.lateCount = lateCount; }

        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public List<StudentSummary> getStudents() { return students; }
    public void setStudents(List<StudentSummary> students) { this.students = students; }
}
