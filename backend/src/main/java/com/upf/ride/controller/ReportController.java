package com.upf.ride.controller;

import com.upf.ride.dto.request.ReportRequest;
import com.upf.ride.dto.response.ReportResponse;
import com.upf.ride.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /** POST /api/reports — Signaler un utilisateur */
    @PostMapping
    public ResponseEntity<ReportResponse> submit(
            @Valid @RequestBody ReportRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportService.submit(req, userDetails.getUsername()));
    }
}
