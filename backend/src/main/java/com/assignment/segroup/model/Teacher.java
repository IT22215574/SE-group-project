package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "teachers")
public class Teacher {

    @Id
    private String id;

    private String teacherId;
    private String firstName;
    private String lastName;
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

    // Legacy fields kept so older seed data and UI references remain compatible.
    private String name;
    private String subject;

    public Teacher() {}

    public Teacher(String name, String subject) {
        this.name = name;
        this.subject = subject;
        this.teacherId = "";
        this.firstName = name;
        this.lastName = "";
        this.subjectName = subject;
        this.status = "ACTIVE";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
        syncName();
    }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) {
        this.lastName = lastName;
        syncName();
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
        this.subject = subjectName;
    }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getName() { return name; }
    public void setName(String name) {
        this.name = name;
        if ((firstName == null || firstName.isBlank()) && name != null) {
            this.firstName = name;
        }
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) {
        this.subject = subject;
        if (subjectName == null || subjectName.isBlank()) {
            this.subjectName = subject;
        }
    }

    private void syncName() {
        String fullName = ((firstName == null ? "" : firstName.trim()) + " " + (lastName == null ? "" : lastName.trim())).trim();
        this.name = fullName;
    }
}
