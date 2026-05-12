package com.assignment.segroup.dto;

public record FeeResponse(String id, String userId, String userName, String description, double amount, String dueDate, String status) {
}
