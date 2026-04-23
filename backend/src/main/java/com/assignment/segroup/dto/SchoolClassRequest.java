package com.assignment.segroup.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.HashSet;
import java.util.Set;

public class SchoolClassRequest {

    @NotBlank(message = "Class name is required")
    private String className;

    @NotBlank(message = "Grade is required")
    private String grade;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private Set<String> subjectIds = new HashSet<>();

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public Set<String> getSubjectIds() {
        return subjectIds;
    }

    public void setSubjectIds(Set<String> subjectIds) {
        this.subjectIds = subjectIds;
    }
}
