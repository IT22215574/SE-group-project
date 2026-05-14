package com.assignment.segroup.repository;

import com.assignment.segroup.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    Optional<Attendance> findByClassIdAndDate(String classId, LocalDate date);

    boolean existsByClassIdAndDate(String classId, LocalDate date);

    // Find all attendance documents that contain a record for a specific student
    @Query("{ 'records.studentId': ?0 }")
    List<Attendance> findByRecordsStudentId(String studentId);

    List<Attendance> findByClassId(String classId);
}
