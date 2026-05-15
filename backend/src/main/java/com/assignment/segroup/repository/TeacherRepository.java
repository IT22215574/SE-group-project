package com.assignment.segroup.repository;

import com.assignment.segroup.model.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends MongoRepository<Teacher, String> {
    boolean existsByTeacherIdIgnoreCase(String teacherId);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Teacher> findByTeacherIdIgnoreCase(String teacherId);

    Optional<Teacher> findByEmailIgnoreCase(String email);

    List<Teacher> findBySubjectId(String subjectId);

    List<Teacher> findByClassId(String classId);
}
