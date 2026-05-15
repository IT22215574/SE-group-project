package com.assignment.segroup.dto;

public class ExamResultResponse {
    private String id;
    private String examId;
    private String examName;
    private String subjectName;
    private String studentName;
    private Integer marksObtained;
    private Integer totalMarks;
    private String grade;

    public ExamResultResponse(String id, String examId, String examName,
                               String subjectName, String studentName,
                               Integer marksObtained, Integer totalMarks, String grade) {
        this.id = id;
        this.examId = examId;
        this.examName = examName;
        this.subjectName = subjectName;
        this.studentName = studentName;
        this.marksObtained = marksObtained;
        this.totalMarks = totalMarks;
        this.grade = grade;
    }

    public String getId() { return id; }
    public String getExamId() { return examId; }
    public String getExamName() { return examName; }
    public String getSubjectName() { return subjectName; }
    public String getStudentName() { return studentName; }
    public Integer getMarksObtained() { return marksObtained; }
    public Integer getTotalMarks() { return totalMarks; }
    public String getGrade() { return grade; }
}