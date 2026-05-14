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

    // Returns all students in a given class — used by Teacher form dropdown
    @GetMapping("/students/{classID}")
    public List<User> getStudentsByClass(@PathVariable String classID) {
        return userRepository.findByRoleAndClassID("student", classID);
    }
}
