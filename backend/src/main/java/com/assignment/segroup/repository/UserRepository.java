package com.assignment.segroup.repository;

import com.assignment.segroup.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    boolean existsByEmail(String email);

    List<User> findByRoleIgnoreCaseAndClassId(String role, String classId);
}
