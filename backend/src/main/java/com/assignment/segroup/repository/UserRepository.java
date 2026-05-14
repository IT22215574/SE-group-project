package com.assignment.segroup.repository;

import com.assignment.segroup.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRoleAndClassID(String role, String classID);
    List<User> findByRole(String role);
}
