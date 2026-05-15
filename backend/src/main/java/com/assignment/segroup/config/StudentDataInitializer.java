package com.assignment.segroup.config;

import com.assignment.segroup.model.SchoolClass;
import com.assignment.segroup.model.Student;
import com.assignment.segroup.repository.SchoolClassRepository;
import com.assignment.segroup.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
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
                "Nethmi Perera",
                "nethmi.perera@student.com",
                "0712345678",
                firstClass
        );

        Student studentTwo = buildStudent(
                "Kasun Fernando",
                "kasun.fernando@student.com",
                "0773040132",
                firstClass
        );

        studentRepository.saveAll(List.of(studentOne, studentTwo));
    }

    private Student buildStudent(String name, String email, String phone, SchoolClass schoolClass) {
        Student student = new Student();

        student.setName(name);
        student.setEmail(email);
        student.setPhone(phone);
        student.setClassId(schoolClass == null ? null : schoolClass.getId());
        student.setClassName(schoolClass == null ? null : schoolClass.getClassName());
        student.setCreatedAt(Instant.now());
        student.setUpdatedAt(Instant.now());

        return student;
    }
}