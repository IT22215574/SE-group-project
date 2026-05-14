package com.assignment.segroup.dto;

public class ExamResponse {
    private String id;
    private String examName;
    private String subjectName;
    private String examDate;
    private Integer totalMarks;

    public ExamResponse(String id, String examName, String subjectName,
                        String examDate, Integer totalMarks) {
        this.id = id;
        this.examName = examName;
        this.subjectName = subjectName;
        this.examDate = examDate;
        this.totalMarks = totalMarks;
    }

    public String getId() { return id; }
    public String getExamName() { return examName; }
    public String getSubjectName() { return subjectName; }
    public String getExamDate() { return examDate; }
    public Integer getTotalMarks() { return totalMarks; }
}