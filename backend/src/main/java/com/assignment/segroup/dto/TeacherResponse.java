package com.assignment.segroup.dto;

import java.time.Instant;

public class TeacherResponse {

    private String id;
    private String teacherId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private String subjectId;
    private String subjectName;
    private String classId;
    private String className;
    private String qualification;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public TeacherResponse(String id, String teacherId, String firstName, String lastName, String fullName,
                           String email, String phone, String gender, String subjectId, String subjectName,
                           String classId, String className, String qualification, String status,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.teacherId = teacherId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.classId = classId;
        this.className = className;
        this.qualification = qualification;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public String getTeacherId() { return teacherId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getGender() { return gender; }
    public String getSubjectId() { return subjectId; }
    public String getSubjectName() { return subjectName; }
    public String getClassId() { return classId; }
    public String getClassName() { return className; }
    public String getQualification() { return qualification; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
