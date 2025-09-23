package fsa.training.service.theater;

import fsa.training.entity.Theater;
import fsa.training.entity.Province;
import fsa.training.entity.District;
import fsa.training.factory.TheaterSystemFactory;
import fsa.training.factory.TheaterFactoryCreator;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.specification.TheaterSpecification;
import fsa.training.security.TheaterPermissionEvaluator;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;

@Service
public class TheaterService {
    private final TheaterRepository theaterRepository;
    private final TheaterFactoryCreator factoryCreator = new TheaterFactoryCreator();
    private final TheaterCreationService creationService;
    private final TheaterPermissionEvaluator permissionEvaluator;

    public TheaterService(TheaterRepository theaterRepository,
                         RoomRepository roomRepository,
                         SeatRepository seatRepository,
                         TheaterPermissionEvaluator permissionEvaluator) {
        this.theaterRepository = theaterRepository;
        this.creationService = new TheaterCreationService(theaterRepository, roomRepository, seatRepository);
        this.permissionEvaluator = permissionEvaluator;
    }

    public List<Theater> getAll() {
        return theaterRepository.findAll();
    }

    public Optional<Theater> getById(Long id) {
        return theaterRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Theater> getByIdWithRelations(Long id) {
        return theaterRepository.findById(id).map(theater -> {
            // Force load relationships
            theater.getProvince().getName();
            theater.getDistrict().getName();
            return theater;
        });
    }

    /**
     * Get theaters accessible by the current user based on their role
     * @param username the username
     * @return list of theaters the user can access
     */
    public List<Theater> getTheatersForUser(String username) {
        if (permissionEvaluator.isAdmin(username)) {
            // Admin can see all theaters
            return theaterRepository.findAll();
        } else if (permissionEvaluator.isStaff(username)) {
            // Staff can only see their assigned theater
            Long assignedTheaterId = permissionEvaluator.getAssignedTheaterId(username);
            if (assignedTheaterId != null) {
                return theaterRepository.findById(assignedTheaterId)
                        .map(List::of)
                        .orElse(List.of());
            }
        }
        // User or no permission
        return List.of();
    }

    @Transactional
    public Theater createTheaterWithBrand(String brand,
                                        String theaterName,
                                        String theaterCode,
                                        String address,
                                        String phone,
                                        String description,
                                        Province province,
                                        District district,
                                        List<String> roomNames,
                                        int seatsPerRoom) {
        return creationService.create(brand, theaterName, theaterCode, address, phone, description, province, district, roomNames, seatsPerRoom);
    }

    public String[] getBrandFeatures(String brand) {
        TheaterSystemFactory factory = factoryCreator.getFactory(brand);
        return factory.getBrandFeatures();
    }

    public String getBrandPricingStrategy(String brand) {
        TheaterSystemFactory factory = factoryCreator.getFactory(brand);
        return factory.getPricingStrategy();
    }

    public boolean isBrandSupported(String brand) {
        return factoryCreator.isBrandSupported(brand);
    }

    public String[] getSupportedBrands() {
        return factoryCreator.getSupportedBrands();
    }

    @Transactional
    public Theater createTheater(Theater theater) {
        return theaterRepository.save(theater);
    }

    @Transactional
    public Theater updateTheater(Theater theater) {
        if (!theaterRepository.existsById(theater.getId())) {
            throw new RuntimeException("Theater not found with id: " + theater.getId());
        }
        return theaterRepository.save(theater);
    }

    @Transactional
    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new RuntimeException("Theater not found with id: " + id);
        }
        theaterRepository.deleteById(id);
    }

    public List<Theater> findNearbyTheaters(Double userLatitude, Double userLongitude, Double radiusKm) {
        Specification<Theater> spec = TheaterSpecification.withLatitudeRange(
            userLatitude - (radiusKm / 111.0),
            userLatitude + (radiusKm / 111.0)
        ).and(TheaterSpecification.withLongitudeRange(
            userLongitude - (radiusKm / 111.0),
            userLongitude + (radiusKm / 111.0)
        ));
        List<Theater> nearbyTheaters = theaterRepository.findAll(spec);
        return nearbyTheaters.stream()
                .filter(theater -> theater.getLatitude() != null && theater.getLongitude() != null)
                .sorted(Comparator.comparingDouble(theater ->
                    calculateDistance(userLatitude, userLongitude,
                                   theater.getLatitude(), theater.getLongitude())
                ))
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Transactional
    public void deleteById(Long id) {
        // Check if theater exists
        if (!theaterRepository.existsById(id)) {
            throw new IllegalArgumentException("Theater with id " + id + " not found");
        }
        
        // Delete related entities first using native queries
        // Delete seats first (they reference rooms)
        theaterRepository.deleteSeatsByTheaterId(id);
        
        // Delete showtimes (they reference rooms)
        theaterRepository.deleteShowtimesByTheaterId(id);
        
        // Delete rooms (they reference theater)
        theaterRepository.deleteRoomsByTheaterId(id);
        
        // Delete account permissions (they reference theater)
        theaterRepository.deleteAccountPermissionsByTheaterId(id);
        
        // Now delete the theater
        theaterRepository.deleteById(id);
    }

    @Transactional
    public Theater save(Theater theater) {
        return theaterRepository.save(theater);
    }
}