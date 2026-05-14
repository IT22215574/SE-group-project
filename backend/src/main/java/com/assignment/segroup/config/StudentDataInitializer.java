package com.assignment.segroup.config;

import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Student;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
public class StudentDataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    public StudentDataInitializer(StudentRepository studentRepository, SchoolClassRepository schoolClassRepository) {
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @Override
    public void run(String... args) {
        if (!Boolean.parseBoolean(System.getProperty("seed.demo.students", "false"))) {
            return;
        }
        if (studentRepository.count() > 0) {
            return;
        }

        List<SchoolClass> classes = schoolClassRepository.findAll();
        SchoolClass firstClass = classes.isEmpty() ? null : classes.get(0);

        Student studentOne = buildStudent(
                "STU-2026-001",
                "Nethmi",
                "Perera",
                "nethmi.perera@student.com",
                "Female",
                "10",
                firstClass,
                "Kamal Perera",
                "+94711234567",
                "ACTIVE"
        );

        Student studentTwo = buildStudent(
                "STU-2026-002",
                "Kasun",
                "Fernando",
                "kasun.fernando@student.com",
                "Male",
                "10",
                firstClass,
                "Nirosha Fernando",
                "+94719876543",
                "ACTIVE"
        );

        studentRepository.saveAll(List.of(studentOne, studentTwo));
    }

    private Student buildStudent(String admissionNo, String firstName, String lastName, String email,
                                 String gender, String grade, SchoolClass schoolClass,
                                 String guardianName, String guardianPhone, String status) {
        Student student = new Student();
        student.setAdmissionNo(admissionNo);
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setEmail(email);
        student.setPhone(guardianPhone);
        student.setGender(gender);
        student.setDateOfBirth(LocalDate.of(2010, 1, 10));
        student.setGrade(schoolClass == null ? grade : schoolClass.getGrade());
        student.setClassId(schoolClass == null ? null : schoolClass.getId());
        student.setClassName(schoolClass == null ? null : schoolClass.getClassName());
        student.setGuardianName(guardianName);
        student.setGuardianPhone(guardianPhone);
        student.setGuardianEmail("");
        student.setAddress("Colombo, Sri Lanka");
        student.setEnrollmentDate(LocalDate.now());
        student.setStatus(status);
        student.setNotes("Demo student record for progress presentation");
        student.setCreatedAt(Instant.now());
        student.setUpdatedAt(Instant.now());
        return student;
    }
}
