package fsa.training.repository;

import fsa.training.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    // Get all active banners ordered by display_order
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    // Get active banners within date range
    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "ORDER BY b.displayOrder ASC")
    List<Banner> findActiveBannersForDisplay(LocalDateTime now);
}

