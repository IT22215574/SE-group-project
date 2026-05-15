package com.assignment.segroup.config;

import com.assignment.segroup.model.Subject;
import com.assignment.segroup.model.Teacher;
import com.assignment.segroup.repository.SubjectRepository;
import com.assignment.segroup.repository.TeacherRepository;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import org.bson.Document;
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
                                    MongoTemplate mongoTemplate) {
        return args -> {
            // ── Ensure collections exist ──────────────────────────────
            if (!mongoTemplate.collectionExists("subjects")) {
                mongoTemplate.createCollection("subjects");
            }
            if (!mongoTemplate.collectionExists("school_classes")) {
                mongoTemplate.createCollection("school_classes");
            }

            if (!mongoTemplate.collectionExists("users")) {
                mongoTemplate.createCollection("users");
            }

            // Ensure users.email index is sparse+unique (drop old non-sparse version if present)
            MongoCollection<Document> usersCol = mongoTemplate.getCollection("users");
            for (Document idx : usersCol.listIndexes()) {
                if ("email".equals(idx.getString("name"))) {
                    Boolean sparse = idx.getBoolean("sparse");
                    if (!Boolean.TRUE.equals(sparse)) {
                        usersCol.dropIndex("email");
                    }
                    break;
                }
            }
            boolean emailIndexExists = false;
            for (Document idx : usersCol.listIndexes()) {
                if ("email".equals(idx.getString("name"))) {
                    emailIndexExists = true;
                    break;
                }
            }
            if (!emailIndexExists) {
                usersCol.createIndex(
                    Indexes.ascending("email"),
                    new IndexOptions().name("email").unique(true).sparse(true)
                );
            }

            if (subjectRepository.count() == 0) {
                subjectRepository.saveAll(List.of(
                        new Subject("Mathematics"),
                        new Subject("Science"),
                        new Subject("English"),
                        new Subject("History"),
                        new Subject("ICT")
                ));
            }

            // ── Seed Teachers (only if teachers empty) ─────
            if (teacherRepository.count() == 0) {
                teacherRepository.saveAll(List.of(
                        new Teacher("Mr. Perera", "Mathematics"),
                        new Teacher("Mrs. Silva", "Science"),
                        new Teacher("Mr. Fernando", "English")
                ));

                System.out.println("Teachers seeded successfully.");
            }
        };
    }
}
