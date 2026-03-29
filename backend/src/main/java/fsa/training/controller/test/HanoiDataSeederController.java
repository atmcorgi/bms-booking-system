package fsa.training.controller.test;

import fsa.training.entity.*;
import fsa.training.repository.booking.ShowtimeRepository;
import fsa.training.repository.movie.MovieAssignmentRepository;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.repository.theater.ProvinceRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test/seed-hanoi")
public class HanoiDataSeederController {

    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieAssignmentRepository movieAssignmentRepository;
    private final MovieRequestRepository movieRequestRepository;

    public HanoiDataSeederController(TheaterRepository theaterRepository,
                                     MovieRepository movieRepository,
                                     RoomRepository roomRepository,
                                     ShowtimeRepository showtimeRepository,
                                     MovieAssignmentRepository movieAssignmentRepository,
                                     MovieRequestRepository movieRequestRepository) {
        this.theaterRepository = theaterRepository;
        this.movieRepository = movieRepository;
        this.roomRepository = roomRepository;
        this.showtimeRepository = showtimeRepository;
        this.movieAssignmentRepository = movieAssignmentRepository;
        this.movieRequestRepository = movieRequestRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> seedHanoiData(@RequestParam(value = "key", required = false) String key) {
        if (!"aven2026".equals(key)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden - Invalid Key"));
        }

        // 1. Get Top 5 Movies
        List<Movie> movies = movieRepository.findAll();
        if (movies.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No movies available to seed. Create movies first."));
        }
        List<Movie> topMovies = movies.stream().limit(5).collect(Collectors.toList());

        // 2. Get Theaters in Hanoi
        List<Theater> allTheaters = theaterRepository.findAll();
        List<Theater> hanoiTheaters = allTheaters.stream()
                .filter(t -> t.getDistrict() != null && t.getDistrict().getProvince() != null 
                        && t.getDistrict().getProvince().getName().toLowerCase().contains("hà nội"))
                .collect(Collectors.toList());

        if (hanoiTheaters.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No theaters found in Hanoi."));
        }

        int showtimesCreated = 0;
        int assignmentsCreated = 0;
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.of(2026, 12, 31);

        for (Theater theater : hanoiTheaters) {
            // Find rooms for theater
            List<Room> rooms = roomRepository.findAll().stream()
                    .filter(r -> r.getTheater().getId().equals(theater.getId()))
                    .collect(Collectors.toList());

            if (rooms.isEmpty()) {
                continue; // Skip if no rooms
            }

            for (Movie movie : topMovies) {
                // A. Assign Movie to Theater
                MovieAssignment assignment = movieAssignmentRepository
                        .findFirstByTheater_IdAndMovie_Id(theater.getId(), movie.getId())
                        .orElse(null);

                if (assignment == null) {
                    assignment = new MovieAssignment();
                    assignment.setMovie(movie);
                    assignment.setTheater(theater);
                    assignment.setActiveFrom(startDate);
                    assignment.setActiveTo(endDate);
                    assignment.setFormats("2D");
                    movieAssignmentRepository.save(assignment);
                    assignmentsCreated++;
                } else {
                    // Update validity range
                    assignment.setActiveFrom(startDate);
                    assignment.setActiveTo(endDate);
                    movieAssignmentRepository.save(assignment);
                }

                // B. Create Pending/Published Request
                MovieRequest request = movieRequestRepository
                        .findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theater.getId())
                        .orElse(null);

                if (request == null) {
                    request = new MovieRequest();
                    request.setMovie(movie);
                    request.setMovieCode(movie.getCode());
                    request.setTheater(theater);
                    request.setStatus("PUBLISHED"); // Simulate published state directly!
                    request.setCreatedBy("SEEDER");
                    movieRequestRepository.save(request);
                } else {
                    request.setStatus("PUBLISHED");
                    movieRequestRepository.save(request);
                }

                // C. Schedule Showtimes from today until Dec 31, 2026
                List<Showtime> newShowtimes = new ArrayList<>();
                // Pick a random room for this movie in this theater
                Room selectedRoom = rooms.get((int) (Math.random() * rooms.size()));
                
                // Fetch all existing showtimes for this room to avoid N+1 queries
                Set<String> existingShowtimes = showtimeRepository.findAll().stream()
                        .filter(s -> s.getRoom().getId().equals(selectedRoom.getId()) &&
                                     !s.getShowDate().isBefore(startDate) &&
                                     !s.getShowDate().isAfter(endDate))
                        .map(s -> s.getShowDate().toString() + "_" + s.getShowTime().toString())
                        .collect(Collectors.toSet());
                
                // Let's pick 2 random times for this movie every day
                LocalTime[] times = {LocalTime.of(10, 0), LocalTime.of(14, 30), LocalTime.of(19, 0), LocalTime.of(21, 30)};
                LocalTime t1 = times[(int) (Math.random() * 2)]; // Morning/Afternoon
                LocalTime t2 = times[2 + (int) (Math.random() * 2)]; // Evening

                for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                    String key1 = date.toString() + "_" + t1.toString();
                    if (!existingShowtimes.contains(key1)) {
                        Showtime s1 = new Showtime();
                        s1.setTheater(theater);
                        s1.setRoom(selectedRoom);
                        s1.setMovie(movie);
                        s1.setMovieRequest(request);
                        s1.setShowDate(date);
                        s1.setShowTime(t1);
                        s1.setPriceStandard(65000);
                        s1.setPriceVip(85000);
                        newShowtimes.add(s1);
                        existingShowtimes.add(key1);
                    }

                    String key2 = date.toString() + "_" + t2.toString();
                    if (!existingShowtimes.contains(key2)) {
                        Showtime s2 = new Showtime();
                        s2.setTheater(theater);
                        s2.setRoom(selectedRoom);
                        s2.setMovie(movie);
                        s2.setMovieRequest(request);
                        s2.setShowDate(date);
                        s2.setShowTime(t2);
                        s2.setPriceStandard(65000);
                        s2.setPriceVip(85000);
                        newShowtimes.add(s2);
                        existingShowtimes.add(key2);
                    }
                }
                
                // Batch save
                if (!newShowtimes.isEmpty()) {
                    showtimeRepository.saveAll(newShowtimes);
                    showtimesCreated += newShowtimes.size();
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Seeding hoàn thành!");
        response.put("hanoiTheatersProcessed", hanoiTheaters.size());
        response.put("assignmentsCreated", assignmentsCreated);
        response.put("showtimesCreated", showtimesCreated);
        response.put("dateRange", startDate + " to " + endDate);

        return ResponseEntity.ok(response);
    }
}
