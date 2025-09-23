package fsa.training.controller.theater;

import fsa.training.entity.Theater;
import fsa.training.service.theater.TheaterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
public class TheaterApiController {
    
    private final TheaterService theaterService;
    
    public TheaterApiController(TheaterService theaterService) {
        this.theaterService = theaterService;
    }
    
    @GetMapping("/nearby")
    public ResponseEntity<List<Theater>> getNearbyTheaters(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") Double radiusKm) {
        
        try {
            List<Theater> nearbyTheaters = theaterService.findNearbyTheaters(latitude, longitude, radiusKm);
            return ResponseEntity.ok(nearbyTheaters);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
