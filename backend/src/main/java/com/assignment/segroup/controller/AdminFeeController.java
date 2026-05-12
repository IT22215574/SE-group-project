package com.assignment.segroup.controller;

import com.assignment.segroup.dto.FeeRequest;
import com.assignment.segroup.dto.FeeResponse;
import com.assignment.segroup.model.Fee;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/fees")
public class AdminFeeController {

    private final FeeRepository feeRepository;
    private final UserRepository userRepository;

    public AdminFeeController(FeeRepository feeRepository, UserRepository userRepository) {
        this.feeRepository = feeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<FeeResponse> listFees(@RequestParam(required = false) String userId) {
        List<Fee> fees;
        if (userId != null && !userId.isBlank()) {
            fees = feeRepository.findByUserId(userId.trim());
        } else {
            fees = feeRepository.findAll();
        }

        return fees.stream()
                .sorted(Comparator.comparing(Fee::getDueDate).reversed())
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public FeeResponse getFeeById(@PathVariable String id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found"));
        return toResponse(fee);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeeResponse createFee(@Valid @RequestBody FeeRequest request) {
        if (!userRepository.existsById(request.getUserId().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found for the given userId");
        }

        Fee fee = new Fee();
        applyRequestToFee(fee, request);
        Fee saved = feeRepository.save(fee);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public FeeResponse updateFee(@PathVariable String id, @Valid @RequestBody FeeRequest request) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found"));

        if (!userRepository.existsById(request.getUserId().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found for the given userId");
        }

        applyRequestToFee(fee, request);
        Fee updated = feeRepository.save(fee);
        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFee(@PathVariable String id) {
        if (!feeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found");
        }
        feeRepository.deleteById(id);
    }

    private void applyRequestToFee(Fee fee, FeeRequest request) {
        fee.setUserId(request.getUserId().trim());
        fee.setDescription(request.getDescription().trim());
        fee.setAmount(request.getAmount());
        fee.setDueDate(request.getDueDate().trim());
        fee.setStatus(request.getStatus().trim().toUpperCase());
    }

    private FeeResponse toResponse(Fee fee) {
        String userName = userRepository.findById(fee.getUserId())
                .map(User::getName)
                .orElse("Unknown");

        return new FeeResponse(
                fee.getId(),
                fee.getUserId(),
                userName,
                fee.getDescription(),
                fee.getAmount(),
                fee.getDueDate(),
                fee.getStatus()
        );
    }
}
