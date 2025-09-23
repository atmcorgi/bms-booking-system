package fsa.training.controller.admin;

import fsa.training.entity.Theater;
import fsa.training.entity.Province;
import fsa.training.entity.District;
import fsa.training.service.theater.TheaterService;
import fsa.training.repository.theater.ProvinceRepository;
import fsa.training.repository.theater.DistrictRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/theaters/v2")
@PreAuthorize("hasAuthority('ADMIN')")
public class TheaterAdminRestController {
    
    @Autowired
    private TheaterService theaterService;
    
    @Autowired
    private ProvinceRepository provinceRepository;
    
    @Autowired
    private DistrictRepository districtRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTheaters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String q,
            Authentication authentication) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Get theaters based on user permissions
            List<Theater> theaters = theaterService.getTheatersForUser(authentication.getName());
            
            // Apply search filter if provided
            if (q != null && !q.trim().isEmpty()) {
                theaters = theaters.stream()
                    .filter(t -> t.getName().toLowerCase().contains(q.toLowerCase()) ||
                               t.getCode().toLowerCase().contains(q.toLowerCase()) ||
                               t.getAddress().toLowerCase().contains(q.toLowerCase()))
                    .collect(Collectors.toList());
            }
            
            // Manual pagination
            int totalElements = theaters.size();
            int start = page * size;
            int end = Math.min(start + size, totalElements);
            
            List<Theater> pagedTheaters = theaters.subList(start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("items", pagedTheaters);
            response.put("totalElements", totalElements);
            response.put("totalPages", (int) Math.ceil((double) totalElements / size));
            response.put("currentPage", page);
            response.put("size", size);
            response.put("hasMore", end < totalElements);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch theaters: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Theater> getTheaterById(@PathVariable Long id, Authentication authentication) {
        try {
            List<Theater> userTheaters = theaterService.getTheatersForUser(authentication.getName());
            Theater theater = userTheaters.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElse(null);
                
            if (theater == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(theater);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTheater(@RequestBody Theater theater, Authentication authentication) {
        try {
            Theater createdTheater = theaterService.createTheater(theater);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Theater created successfully");
            response.put("theater", createdTheater);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create theater: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTheater(
            @PathVariable Long id, 
            @RequestBody Theater theater, 
            Authentication authentication) {
        try {
            // Check if user has access to this theater
            List<Theater> userTheaters = theaterService.getTheatersForUser(authentication.getName());
            boolean hasAccess = userTheaters.stream().anyMatch(t -> t.getId().equals(id));
            
            if (!hasAccess) {
                return ResponseEntity.status(403).build();
            }
            
            theater.setId(id);
            Theater updatedTheater = theaterService.updateTheater(theater);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Theater updated successfully");
            response.put("theater", updatedTheater);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update theater: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTheater(@PathVariable Long id, Authentication authentication) {
        try {
            // Check if user has access to this theater
            List<Theater> userTheaters = theaterService.getTheatersForUser(authentication.getName());
            boolean hasAccess = userTheaters.stream().anyMatch(t -> t.getId().equals(id));
            
            if (!hasAccess) {
                return ResponseEntity.status(403).build();
            }
            
            theaterService.deleteTheater(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Theater deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete theater: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/provinces")
    public ResponseEntity<List<Province>> getAllProvinces() {
        try {
            List<Province> provinces = provinceRepository.findAll();
            return ResponseEntity.ok(provinces);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/districts")
    public ResponseEntity<List<District>> getDistrictsByProvince(@RequestParam Long provinceId) {
        try {
            List<District> districts = districtRepository.findByProvinceId(provinceId);
            return ResponseEntity.ok(districts);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
