package com.assignment.segroup.dto;

import jakarta.validation.constraints.NotBlank;

public class UserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String email;

    @NotBlank(message = "Role is required")
    private String role;

    private String phone;

    private String classId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
}
