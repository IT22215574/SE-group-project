package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "teachers")
public class Teacher {

    @Id
    private String id;

    private String name;

    private String subject;

    public Teacher() {}

    public Teacher(String name, String subject) {
        this.name = name;
        this.subject = subject;
    }

    public String getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}
