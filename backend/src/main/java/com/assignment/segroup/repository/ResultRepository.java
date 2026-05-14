package com.assignment.segroup.repository;

import com.assignment.segroup.model.Result;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResultRepository extends MongoRepository<Result, String> {
    List<Result> findByClassID(String classID);
    List<Result> findByStudentIDAndVisible(String studentID, boolean visible);
    List<Result> findByClassIDAndSubject(String classID, String subject);
}
