package com.assignment.segroup.repository;

import com.assignment.segroup.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, String> {
    List<Fee> findByUserId(String userId);
    void deleteByUserId(String userId);
}
