package com.assignment.segroup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class FeeRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Description is required")
    private String description;

    @Positive(message = "Amount must be positive")
    private double amount;

    @NotBlank(message = "Due date is required")
    private String dueDate;

    @NotBlank(message = "Status is required")
    private String status;

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
