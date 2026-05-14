package com.assignment.segroup.controller;

import com.assignment.segroup.model.User;
import com.assignment.segroup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/students/{classId}")
    public List<User> getStudentsByClass(@PathVariable String classId) {
        return userRepository.findByRoleAndClassId("student", classId);
    }
    
    @GetMapping("/students")
    public List<User> getAllStudents() {
        return userRepository.findByRole("student");
    }
}
