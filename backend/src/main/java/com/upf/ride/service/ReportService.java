package com.upf.ride.service;

import com.upf.ride.dto.request.ReportRequest;
import com.upf.ride.dto.response.ReportResponse;
import com.upf.ride.entity.*;
import com.upf.ride.entity.enums.ReportStatus;
import com.upf.ride.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    @Transactional
    public ReportResponse submit(ReportRequest req, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail).orElseThrow();
        User reported = userRepository.findById(req.getReportedId())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur signalé introuvable"));

        Trip trip = null;
        if (req.getTripId() != null)
            trip = tripRepository.findById(req.getTripId()).orElse(null);

        Report report = Report.builder()
                .reporter(reporter)
                .reported(reported)
                .trip(trip)
                .type(req.getType())
                .description(req.getDescription())
                .status(ReportStatus.PENDING)
                .build();

        return toResponse(reportRepository.save(report));
    }

    public long countPending() {
        return reportRepository.findByStatus(ReportStatus.PENDING).size();
    }

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReportResponse updateStatus(UUID reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Signalement introuvable"));
        report.setStatus(status);
        return toResponse(reportRepository.save(report));
    }

    private ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .reporter(AuthService.toUserResponse(r.getReporter()))
                .reported(AuthService.toUserResponse(r.getReported()))
                .tripId(r.getTrip() != null ? r.getTrip().getId() : null)
                .type(r.getType())
                .description(r.getDescription())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
