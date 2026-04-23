package com.assignment.segroup.config;

import com.assignment.segroup.model.Subject;
import com.assignment.segroup.repository.SubjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeSubjects(SubjectRepository subjectRepository, MongoTemplate mongoTemplate) {
        return args -> {
            if (!mongoTemplate.collectionExists("subjects")) {
                mongoTemplate.createCollection("subjects");
            }

            if (!mongoTemplate.collectionExists("school_classes")) {
                mongoTemplate.createCollection("school_classes");
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
        };
    }
}
