package fsa.training.controller.report;

import fsa.training.service.report.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statistics")
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statisticsService.getRevenueStats(from, to));
    }

    @GetMapping("/top-movies")
    public ResponseEntity<?> getTopMovies(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statisticsService.getTopMovies(limit));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(statisticsService.getSummary());
    }
}
