package com.assignment.segroup.repository;

import com.assignment.segroup.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    // Used by Notification & Result module (feature branch)
    List<User> findByRoleAndClassID(String role, String classID);

    // Used by Class Management module (main branch)
    List<User> findByRoleAndClassId(String role, String classId);

    List<User> findByRole(String role);
}
