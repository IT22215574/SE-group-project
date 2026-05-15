package com.assignment.segroup.dto;

public class ExamResultRequest {
    private String examId;
    private String studentName;
    private Integer marksObtained;

    public String getExamId() { return examId; }
    public String getStudentName() { return studentName; }
    public Integer getMarksObtained() { return marksObtained; }

    public void setExamId(String examId) { this.examId = examId; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }
}