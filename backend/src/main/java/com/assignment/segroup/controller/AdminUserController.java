package com.assignment.segroup.controller;

import com.assignment.segroup.dto.UserRequest;
import com.assignment.segroup.dto.UserResponse;
import com.assignment.segroup.model.User;
import com.assignment.segroup.repository.FeeRepository;
import com.assignment.segroup.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final FeeRepository feeRepository;

    public AdminUserController(UserRepository userRepository, FeeRepository feeRepository) {
        this.userRepository = userRepository;
        this.feeRepository = feeRepository;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        User user = new User();
        applyRequestToUser(user, request);
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable String id, @Valid @RequestBody UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        applyRequestToUser(user, request);
        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        // also delete all fees associated with the user
        feeRepository.deleteByUserId(id);
        userRepository.deleteById(id);
    }

    private void applyRequestToUser(User user, UserRequest request) {
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim());
        user.setRole(request.getRole().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone()
        );
    }
}
