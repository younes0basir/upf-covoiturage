package com.upf.ride.repository;

import com.upf.ride.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {
    List<Location> findByIsUniversity(Boolean isUniversity);
    
    @org.springframework.data.jpa.repository.Query("SELECT l FROM Location l WHERE " +
            "LOWER(l.name) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(l.address) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "(:name = 'upf' AND LOWER(l.name) LIKE '%université privée%')")
    List<Location> findByNameContainingIgnoreCase(@org.springframework.data.repository.query.Param("name") String name);
    
    List<Location> findByCityIgnoreCase(String city);
}
