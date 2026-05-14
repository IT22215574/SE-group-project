package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "exam_results")
public class ExamResult {

    @Id
    private String id;

    private String examId;
    private String studentName;
    private Integer marksObtained;
    private String grade;

    // Getters
    public String getId() { return id; }
    public String getExamId() { return examId; }
    public String getStudentName() { return studentName; }
    public Integer getMarksObtained() { return marksObtained; }
    public String getGrade() { return grade; }

    // Setters
    public void setExamId(String examId) { this.examId = examId; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }
    public void setGrade(String grade) { this.grade = grade; }
}