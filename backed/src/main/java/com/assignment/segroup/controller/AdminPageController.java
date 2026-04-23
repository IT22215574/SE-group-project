package com.assignment.segroup.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminPageController {

    @GetMapping("/admin/classes")
    public String adminClassPage() {
        return "forward:/admin/classes.html";
    }
}
