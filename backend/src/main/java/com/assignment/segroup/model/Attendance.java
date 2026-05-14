package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "attendance")
@CompoundIndex(name = "class_date_unique", def = "{'classId': 1, 'date': 1}", unique = true)
public class Attendance {

    @Id
    private String id;

    private String classId;
    private String className;
    private LocalDate date;

    // Records embedded directly — no separate collection needed
    private List<AttendanceRecord> records;

    public Attendance() {}

    public Attendance(String classId, String className, LocalDate date, List<AttendanceRecord> records) {
        this.classId = classId;
        this.className = className;
        this.date = date;
        this.records = records;
    }

    public String getId() { return id; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<AttendanceRecord> getRecords() { return records; }
    public void setRecords(List<AttendanceRecord> records) { this.records = records; }
}
