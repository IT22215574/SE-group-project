package com.assignment.segroup.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fees")
public class Fee {

    @Id
    private String id;

    private String userId;   // reference to User._id

    private String description; // e.g. "Term 1 Fee"

    private double amount;

    private String dueDate;  // ISO date string "YYYY-MM-DD"

    private String status;   // "PAID" | "PENDING" | "OVERDUE"

    public Fee() {}

    public String getId() { return id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
