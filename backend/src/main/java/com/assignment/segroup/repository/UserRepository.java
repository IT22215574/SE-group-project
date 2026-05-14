package com.assignment.segroup.repository;

import com.assignment.segroup.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    boolean existsByEmail(String email);
    
    List<User> findByRole(String role);
    
    List<User> findByRoleAndClassId(String role, String classId);
}
