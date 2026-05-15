package com.assignment.segroup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TeacherRequest {

    @NotBlank(message = "Teacher ID is required")
    @Size(max = 30, message = "Teacher ID must be 30 characters or less")
    private String teacherId;

    @NotBlank(message = "First name is required")
    @Size(max = 60, message = "First name must be 60 characters or less")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60, message = "Last name must be 60 characters or less")
    private String lastName;

    @Email(message = "Email must be valid")
    @Size(max = 120, message = "Email must be 120 characters or less")
    private String email;

    @Pattern(regexp = "^$|^[0-9+()\\- ]{7,20}$", message = "Phone number is invalid")
    private String phone;

    @Size(max = 30, message = "Gender must be 30 characters or less")
    private String gender;

    private String subjectId;
    private String subjectName;
    private String classId;
    private String className;

    @Size(max = 150, message = "Qualification must be 150 characters or less")
    private String qualification;

    @NotBlank(message = "Status is required")
    private String status;

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
