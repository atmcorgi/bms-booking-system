package fsa.training.controller.theater;

import fsa.training.entity.Theater;
import fsa.training.service.theater.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Controller
@RequestMapping("/theaters")
public class TheaterController {

    @Autowired
    private TheaterService theaterService;

    @GetMapping("/nearby")
    public String nearbyTheaters() {
        return "theater/nearby";
    }

    @GetMapping("/api/nearby")
    @ResponseBody
    public ResponseEntity<List<Theater>> getNearbyTheaters(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") Double radiusKm) {
        
        List<Theater> nearbyTheaters = theaterService.findNearbyTheaters(latitude, longitude, radiusKm);
        return ResponseEntity.ok(nearbyTheaters);
    }

    @GetMapping("/api/all")
    @ResponseBody
    public ResponseEntity<List<Theater>> getAllTheaters() {
        List<Theater> theaters = theaterService.getAll();
        return ResponseEntity.ok(theaters);
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Theater> getTheaterById(@PathVariable Long id) {
        return theaterService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/{id}/with-location")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getTheaterWithLocation(@PathVariable Long id) {
        return theaterService.getById(id)
            .map(theater -> {
                Map<String, Object> result = new HashMap<>();
                result.put("theater", theater);
                
                if (theater.getDistrict() != null) {
                    result.put("district", theater.getDistrict());
                    if (theater.getDistrict().getProvince() != null) {
                        result.put("province", theater.getDistrict().getProvince());
                    }
                }

                return ResponseEntity.ok(result);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
