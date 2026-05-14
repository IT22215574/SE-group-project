package com.assignment.segroup.repository;

import com.assignment.segroup.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientID(String recipientID);
    List<Notification> findByRecipientIDOrderByCreatedAtDesc(String recipientID);
}
