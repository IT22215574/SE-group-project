package com.assignment.segroup.repository;

import com.assignment.segroup.model.SchoolClass;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SchoolClassRepository extends MongoRepository<SchoolClass, String> {
}
