package com.assignment.segroup.config;

import com.assignment.segroup.model.Student;
import com.assignment.segroup.model.Subject;
import com.assignment.segroup.model.Teacher;
import com.assignment.segroup.repository.StudentRepository;
import com.assignment.segroup.repository.SubjectRepository;
import com.assignment.segroup.repository.TeacherRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeData(SubjectRepository subjectRepository,
                                    TeacherRepository teacherRepository,
                                    StudentRepository studentRepository,
                                    MongoTemplate mongoTemplate) {
        return args -> {
            // ── Ensure collections exist ──────────────────────────────
            if (!mongoTemplate.collectionExists("subjects")) {
                mongoTemplate.createCollection("subjects");
            }
            if (!mongoTemplate.collectionExists("school_classes")) {
                mongoTemplate.createCollection("school_classes");
            }

            // ── Seed Subjects ─────────────────────────────────────────
            if (subjectRepository.count() == 0) {
                subjectRepository.saveAll(List.of(
                        new Subject("Mathematics"),
                        new Subject("Science"),
                        new Subject("English"),
                        new Subject("History"),
                        new Subject("ICT")
                ));
            }

            // ── Seed Teachers & Students (only if teachers empty) ─────
            if (teacherRepository.count() == 0) {
                Teacher t1 = teacherRepository.save(new Teacher("Mr. Perera", "Mathematics"));
                Teacher t2 = teacherRepository.save(new Teacher("Mrs. Silva", "Science"));
                Teacher t3 = teacherRepository.save(new Teacher("Mr. Fernando", "English"));

                // We create students linked to "Grade 10-A", "Grade 10-B", "Grade 11-A"
                // using teacher IDs as surrogate class keys so attendance UI works out of the box.
                // When real school_classes are created via the UI, update student classIds accordingly.
                studentRepository.saveAll(List.of(
                        new Student("Nimal Bandara",     t1.getId()),
                        new Student("Kamal Jayasinghe",  t1.getId()),
                        new Student("Saman Kumara",       t1.getId()),
                        new Student("Amali Perera",       t1.getId()),
                        new Student("Dinesh Rajapaksha",  t1.getId()),

                        new Student("Tharushi Silva",     t2.getId()),
                        new Student("Ruwan Wickrama",     t2.getId()),
                        new Student("Nadeesha Dias",      t2.getId()),
                        new Student("Kasun Rathnayake",   t2.getId()),

                        new Student("Chamari Fernando",   t3.getId()),
                        new Student("Lahiru Herath",      t3.getId()),
                        new Student("Sachini Weerasinghe",t3.getId()),
                        new Student("Thilina Gamage",     t3.getId()),
                        new Student("Hiruni Malsha",      t3.getId())
                ));

                System.out.println("✅ Teachers and students seeded successfully!");
            }
        };
    }
}
