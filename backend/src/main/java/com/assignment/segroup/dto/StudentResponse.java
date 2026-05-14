package com.assignment.segroup.dto;

import java.time.Instant;
import java.time.LocalDate;

public class StudentResponse {

    private String id;
    private String admissionNo;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private String grade;
    private String classId;
    private String className;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String address;
    private LocalDate enrollmentDate;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public StudentResponse(String id, String admissionNo, String firstName, String lastName, String fullName,
                           String email, String phone, String gender, LocalDate dateOfBirth, String grade,
                           String classId, String className, String guardianName, String guardianPhone,
                           String guardianEmail, String address, LocalDate enrollmentDate, String status,
                           String notes, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.admissionNo = admissionNo;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.grade = grade;
        this.classId = classId;
        this.className = className;
        this.guardianName = guardianName;
        this.guardianPhone = guardianPhone;
        this.guardianEmail = guardianEmail;
        this.address = address;
        this.enrollmentDate = enrollmentDate;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public String getAdmissionNo() { return admissionNo; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getGrade() { return grade; }
    public String getClassId() { return classId; }
    public String getClassName() { return className; }
    public String getGuardianName() { return guardianName; }
    public String getGuardianPhone() { return guardianPhone; }
    public String getGuardianEmail() { return guardianEmail; }
    public String getAddress() { return address; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
