package com.assignment.segroup.repository;

import com.assignment.segroup.model.Fee;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FeeRepository extends MongoRepository<Fee, String> {
    List<Fee> findByUserId(String userId);
    void deleteByUserId(String userId);
}
