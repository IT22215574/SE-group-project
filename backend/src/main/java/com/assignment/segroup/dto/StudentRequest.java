package com.assignment.segroup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StudentRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must be 120 characters or less")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Student email must be valid")
    @Size(max = 120, message = "Email must be 120 characters or less")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^0\\d{9}$", message = "Phone number must be 10 digits and start with 0")
    private String phone;

    @NotBlank(message = "Class is required")
    private String classId;

    private String className;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }
}