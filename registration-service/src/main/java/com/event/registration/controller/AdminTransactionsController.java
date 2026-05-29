package com.event.registration.controller;

import com.event.registration.dto.AdminTransactionDto;
import com.event.registration.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/registrations/admin")
@RequiredArgsConstructor
public class AdminTransactionsController {

    private final RegistrationService registrationService;

    @GetMapping("/transactions")
    public ResponseEntity<Page<AdminTransactionDto>> listTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminTransactionDto> result = registrationService.getAdminTransactions(pageable);
        return ResponseEntity.ok(result);
    }
}

