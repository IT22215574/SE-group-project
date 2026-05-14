package com.assignment.segroup.repository;

import com.assignment.segroup.model.ExamResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExamResultRepository extends MongoRepository<ExamResult, String> {
    List<ExamResult> findByExamId(String examId);
    void deleteByExamId(String examId);
}