package com.assignment.segroup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class StudentRequest {

    @NotBlank(message = "Admission number is required")
    @Size(max = 30, message = "Admission number must be 30 characters or less")
    private String admissionNo;

    @NotBlank(message = "First name is required")
    @Size(max = 60, message = "First name must be 60 characters or less")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60, message = "Last name must be 60 characters or less")
    private String lastName;

    @Email(message = "Student email must be valid")
    @Size(max = 120, message = "Email must be 120 characters or less")
    private String email;

    @Pattern(regexp = "^$|^[0-9+()\\- ]{7,20}$", message = "Student phone number is invalid")
    private String phone;

    @NotBlank(message = "Gender is required")
    private String gender;

    @Past(message = "Date of birth must be a past date")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Grade is required")
    private String grade;

    private String classId;
    private String className;

    @NotBlank(message = "Guardian name is required")
    @Size(max = 100, message = "Guardian name must be 100 characters or less")
    private String guardianName;

    @NotBlank(message = "Guardian phone is required")
    @Pattern(regexp = "^0\\d{9}$", message = "Guardian phone number must be 10 digits and start with 0")
    private String guardianPhone;

    @Email(message = "Guardian email must be valid")
    @Size(max = 120, message = "Guardian email must be 120 characters or less")
    private String guardianEmail;

    @Size(max = 300, message = "Address must be 300 characters or less")
    private String address;

    @PastOrPresent(message = "Enrollment date cannot be in the future")
    private LocalDate enrollmentDate;

    @NotBlank(message = "Status is required")
    private String status;

    @Size(max = 500, message = "Notes must be 500 characters or less")
    private String notes;

    public String getAdmissionNo() {
        return admissionNo;
    }

    public void setAdmissionNo(String admissionNo) {
        this.admissionNo = admissionNo;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
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

    public String getGuardianName() {
        return guardianName;
    }

    public void setGuardianName(String guardianName) {
        this.guardianName = guardianName;
    }

    public String getGuardianPhone() {
        return guardianPhone;
    }

    public void setGuardianPhone(String guardianPhone) {
        this.guardianPhone = guardianPhone;
    }

    public String getGuardianEmail() {
        return guardianEmail;
    }

    public void setGuardianEmail(String guardianEmail) {
        this.guardianEmail = guardianEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
