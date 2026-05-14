package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "exams")
public class Exam {

    @Id
    private String id;

    private String examName;
    private String subjectName;
    private String examDate;
    private Integer totalMarks;

    // Getters
    public String getId() { return id; }
    public String getExamName() { return examName; }
    public String getSubjectName() { return subjectName; }
    public String getExamDate() { return examDate; }
    public Integer getTotalMarks() { return totalMarks; }

    // Setters
    public void setExamName(String examName) { this.examName = examName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public void setExamDate(String examDate) { this.examDate = examDate; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
}