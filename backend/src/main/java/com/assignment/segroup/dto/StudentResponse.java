package com.assignment.segroup.dto;

import java.time.Instant;

public class StudentResponse {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String classId;
    private String className;
    private Instant createdAt;
    private Instant updatedAt;

    public StudentResponse(String id, String name, String email, String phone,
                           String classId, String className,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.classId = classId;
        this.className = className;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}