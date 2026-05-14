package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
public class Student {

    @Id
    private String id;

    private String name;

    private String classId; // references school_classes collection

    public Student() {}

    public Student(String name, String classId) {
        this.name = name;
        this.classId = classId;
    }

    public String getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
}
