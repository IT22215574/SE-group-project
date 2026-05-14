package com.assignment.segroup.repository;

import com.assignment.segroup.model.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TeacherRepository extends MongoRepository<Teacher, String> {
}
