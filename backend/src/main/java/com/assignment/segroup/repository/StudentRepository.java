package com.assignment.segroup.repository;

import com.assignment.segroup.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudentRepository extends MongoRepository<Student, String> {
    List<Student> findByClassId(String classId);
}
