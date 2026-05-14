package com.upf.ride.repository;

import com.upf.ride.entity.Report;
import com.upf.ride.entity.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByReporterId(UUID reporterId);
    List<Report> findByReportedId(UUID reportedId);
    List<Report> findByStatus(ReportStatus status);
}
