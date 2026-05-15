package com.assignment.segroup.dto;

public class ExamRequest {
    private String examName;
    private String subjectName;
    private String examDate;
    private Integer totalMarks;

    public String getExamName() { return examName; }
    public String getSubjectName() { return subjectName; }
    public String getExamDate() { return examDate; }
    public Integer getTotalMarks() { return totalMarks; }

    public void setExamName(String examName) { this.examName = examName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public void setExamDate(String examDate) { this.examDate = examDate; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
}