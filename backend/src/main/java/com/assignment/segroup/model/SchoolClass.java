package com.assignment.segroup.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "school_classes")
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String className;

    private String grade;

    private String academicYear;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "school_class_subjects",
        joinColumns = @JoinColumn(name = "school_class_id"),
        inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();

    public SchoolClass() {
    }

    public String getId() {
        return id;
    }

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

    public Set<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(Set<Subject> subjects) {
        this.subjects = subjects;
    }
}
