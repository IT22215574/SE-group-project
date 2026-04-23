package com.assignment.segroup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "Backend is running. Frontend is in the frontend folder. Open /admin/classes for LMS class management.";
    }
}
