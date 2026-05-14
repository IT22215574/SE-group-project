package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String password;
    private String role; // "teacher" or "student"
    private String phone;

    // classID is used by the Notification & Result module (feature branch)
    // classId  is used by the Class Management module (main branch)
    // Both are kept for full compatibility across all modules.
    private String classID;
    private String classId;

    private List<String> subjects;

    public User() {}

    // ── Getters and Setters ───────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    // Used by Notification & Result module
    public String getClassID() { return classID; }
    public void setClassID(String classID) {
        this.classID = classID;
        this.classId = classID; // keep both in sync
    }

    // Used by Class Management module
    public String getClassId() { return classId; }
    public void setClassId(String classId) {
        this.classId = classId;
        this.classID = classId; // keep both in sync
    }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }
}
