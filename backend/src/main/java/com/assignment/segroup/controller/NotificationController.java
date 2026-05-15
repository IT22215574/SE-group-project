package com.assignment.segroup.controller;

import com.assignment.segroup.model.Notification;
import com.assignment.segroup.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // ── READ ─────────────────────────────────────────────────────────────────
    @GetMapping("/{recipientID}")
    public List<Notification> getNotifications(@PathVariable String recipientID) {
        return notificationRepository.findByRecipientIDOrderByCreatedAtDesc(recipientID);
    }

    // ── UPDATE: toggle read / unread status ───────────────────────────────────
    @PutMapping("/{id}/read")
    public ResponseEntity<?> toggleReadStatus(@PathVariable String id) {
        return notificationRepository.findById(id).map(n -> {
            n.setRead(!n.isRead()); // toggle between read and unread
            return ResponseEntity.ok(notificationRepository.save(n));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE: single notification ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Notification deleted.");
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.notFound().build();
    }

    // ── DELETE: clear ALL notifications for a student ────────────────────────
    @DeleteMapping("/clear/{recipientID}")
    public ResponseEntity<?> clearAllNotifications(@PathVariable String recipientID) {
        List<Notification> list = notificationRepository.findByRecipientIDOrderByCreatedAtDesc(recipientID);
        notificationRepository.deleteAll(list);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "All notifications cleared.");
        return ResponseEntity.ok(resp);
    }
}
