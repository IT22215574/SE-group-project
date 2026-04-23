package com.assignment.segroup.repository;

import com.assignment.segroup.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubjectRepository extends MongoRepository<Subject, String> {
    boolean existsByNameIgnoreCase(String name);
}
