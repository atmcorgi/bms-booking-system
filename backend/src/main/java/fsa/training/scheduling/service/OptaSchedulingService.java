package fsa.training.scheduling.service;

import fsa.training.entity.MovieRequest;
import fsa.training.entity.Room;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.scheduling.constraints.SchedulingConstraintProvider;
import fsa.training.scheduling.domain.*;
import fsa.training.scheduling.util.SolverProgressHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.optaplanner.core.api.solver.SolverFactory;
import org.optaplanner.core.api.solver.Solver;
import org.optaplanner.core.config.solver.SolverConfig;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OptaSchedulingService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MovieRequestRepository movieRequestRepository;
    
    @Autowired
    private fsa.training.repository.booking.ShowtimeRepository showtimeRepository;

    public TheaterScheduleSolution solve(Long theaterId, LocalDate start, LocalDate end, List<String> filterCodes) {
        return solve(theaterId, start, end, filterCodes, new fsa.training.scheduling.domain.SchedulingConfig());
    }

    public TheaterScheduleSolution solve(Long theaterId, LocalDate start, LocalDate end, List<String> filterCodes,
                                         fsa.training.scheduling.domain.SchedulingConfig config) {
        List<Room> rooms = roomRepository.findByTheaterId(theaterId);
        List<RoomResource> roomFacts = rooms.stream().map(RoomResource::from).collect(Collectors.toList());

        System.out.println("=== SchedulingConfig ===" + config);

        // ✅ FIX: Load existing showtimes to mark blocked time slots
        List<fsa.training.entity.Showtime> existingShowtimes = new ArrayList<>();
        LocalDate d = start;
        while (!d.isAfter(end)) {
            List<fsa.training.entity.Showtime> dailyShowtimes = showtimeRepository.findByTheaterIdsAndShowDate(
                List.of(theaterId), d
            );
            existingShowtimes.addAll(dailyShowtimes);
            d = d.plusDays(1);
        }
        System.out.println("✅ Loaded " + existingShowtimes.size() + " existing showtimes for conflict detection");
        
        List<TimeGrain> timeFacts = new ArrayList<>();
        d = start;
        // Use config values instead of hardcoded constants
        LocalTime open = LocalTime.of(config.getOpenHour(), config.getOpenMinute());
        LocalTime close = LocalTime.of(config.getCloseHour(), config.getCloseMinute());
        int grainMinutes = config.getTimeGrainMinutes();
        int bufferMin = config.getBufferMinutes();

        while (!d.isAfter(end)) {
            final LocalDate currentDate = d;
            for (LocalTime t = open; !t.isAfter(close); t = t.plusMinutes(grainMinutes)) {
                final LocalTime currentTime = t;
                TimeGrain grain = new TimeGrain(currentDate, currentTime);
                
                // Mark this time slot as occupied if there's an existing showtime
                boolean isOccupied = existingShowtimes.stream()
                    .anyMatch(existing -> {
                        if (!existing.getShowDate().equals(currentDate)) return false;
                        
                        LocalTime existingStart = existing.getShowTime();
                        int duration = existing.getMovie().getDuration() > 0 
                            ? existing.getMovie().getDuration() 
                            : 120;
                        LocalTime existingEnd = existingStart.plusMinutes(duration + bufferMin);
                        
                        // Check if current time slot overlaps with existing showtime
                        return !currentTime.isBefore(existingStart) && currentTime.isBefore(existingEnd);
                    });
                
                if (!isOccupied) {
                    timeFacts.add(grain);
                }
            }
            d = d.plusDays(1);
        }

        List<MovieRequest> reqs = movieRequestRepository.findByStatusAndTheater_Id("PENDING", theaterId)
                .stream()
                .filter(r -> filterCodes == null || filterCodes.contains(r.getMovie().getCode()))
                .collect(Collectors.toList());

        // Create multiple assignments per movie per day based on a simple quota
        List<ShowtimeAssignment> assignments = new ArrayList<>();
        long idSeq = 1;
        LocalDate day = start;
        while (!day.isAfter(end)) {
            for (MovieRequest r : reqs) {
                int perDayQuota = estimatePerDayQuota(r, config.getMaxShowsPerMoviePerDay());
                for (int i = 0; i < perDayQuota; i++) {
                    ShowtimeAssignment a = new ShowtimeAssignment();
                    a.setId(idSeq++);
                    a.setMovieRequest(r);
                    // Inject config into assignment so ConstraintProvider can use all params
                    a.setBufferMinutes(config.getBufferMinutes());
                    a.setCloseHour(config.getCloseHour());
                    a.setCloseMinute(config.getCloseMinute());
                    a.setPrimeTimeWeight(config.getPrimeTimeWeight());
                    a.setRoomBalanceWeight(config.getRoomBalanceWeight());
                    // timeGrain will be chosen by solver
                    assignments.add(a);
                }
            }
            day = day.plusDays(1);
        }

        // Build problem with config-aware constraint provider
        TheaterScheduleSolution problem = new TheaterScheduleSolution(roomFacts, timeFacts, assignments);
        problem.setConfig(config);

        // Debug logging
        System.out.println("=== OPTA PLANNER DEBUG ===");
        System.out.println("Rooms: " + roomFacts.size());
        System.out.println("Time slots: " + timeFacts.size());
        System.out.println("Movie requests: " + reqs.size());
        System.out.println("Total assignments: " + assignments.size());
        System.out.println("Days: " + start + " to " + end);
        
        // Check if we have enough capacity
        int totalCapacity = roomFacts.size() * timeFacts.size();
        System.out.println("Total capacity (rooms × time slots): " + totalCapacity);
        System.out.println("Capacity utilization: " + (assignments.size() * 100.0 / totalCapacity) + "%");

        // Use XML config for better optimization settings
        SolverFactory<TheaterScheduleSolution> factory = SolverFactory.createFromXmlResource("solverConfig.xml");
        Solver<TheaterScheduleSolution> solver = factory.buildSolver();
        
        // Log initial problem state
        System.out.println("=== OPTAPLANNER SOLVING ===");
        System.out.println("Rooms: " + roomFacts.size());
        System.out.println("Time grains: " + timeFacts.size());
        System.out.println("Assignments: " + assignments.size());
        System.out.println("Initial score: " + problem.getScore());
        
        // Add solver event listener to track real progress
        solver.addEventListener(event -> {
            if (event.isEveryProblemFactChangeProcessed()) {
                long assigned = event.getNewBestSolution().getAssignments().stream()
                    .filter(a -> a.getRoom() != null && a.getTimeGrain() != null).count();
                long total = event.getNewBestSolution().getAssignments().size();
                int progress = total > 0 ? (int) (assigned * 100 / total) : 0;
                
                System.out.println("Solver progress: " + progress + "% (" + assigned + "/" + total + 
                    " assigned) - Score: " + event.getNewBestScore());
                
                // Store progress in thread local for API access
                SolverProgressHolder.setProgress(progress);
            }
        });
        
        System.out.println("Starting solver...");
        SolverProgressHolder.setProgress(0);
        TheaterScheduleSolution solved = solver.solve(problem);
        SolverProgressHolder.setProgress(100);
        System.out.println("Solver completed!");
        
        // Log final solution state
        System.out.println("Final score: " + solved.getScore());
        System.out.println("Solution assignments: " + solved.getAssignments().size());
        
        // --- VALIDATION LOGIC (MANUAL) ---
        try {
            System.out.println("DEBUG: Starting manual validation for " + solved.getAssignments().size() + " assignments");
            // 1. Check for conflicts with existing showtimes
            for (ShowtimeAssignment a : solved.getAssignments()) {
                if (a.getRoom() == null || a.getTimeGrain() == null) continue;
                
                LocalTime assignmentStart = a.getTimeGrain().getStart();
                int assignmentStartMins = assignmentStart.getHour() * 60 + assignmentStart.getMinute();
                int duration = a.getMovieRequest().getMovie().getDuration();
                if (duration <= 0) duration = 120;
                int assignmentEndMins = assignmentStartMins + duration + bufferMin;
                
                boolean conflict = existingShowtimes.stream().anyMatch(ex -> {
                    if (!ex.getRoom().getId().equals(a.getRoom().getId())) return false;
                    if (!ex.getShowDate().equals(a.getTimeGrain().getDate())) return false;
                    
                    LocalTime exStart = ex.getShowTime();
                    int exStartMins = exStart.getHour() * 60 + exStart.getMinute();
                    int exDur = ex.getMovie().getDuration() > 0 ? ex.getMovie().getDuration() : 120;
                    int exEndMins = exStartMins + exDur + bufferMin;
                    
                    return assignmentStartMins < exEndMins && exStartMins < assignmentEndMins;
                });
                
                if (conflict) {
                    a.addPlanningError("Xung đột với suất chiếu đã có");
                }
            }
            
            // 2. Check for overlaps between new assignments
            java.util.Map<String, List<ShowtimeAssignment>> byRoomDate = new java.util.HashMap<>();
            for (ShowtimeAssignment a : solved.getAssignments()) {
                if (a.getRoom() == null || a.getTimeGrain() == null) continue;
                String key = a.getRoom().getId() + "_" + a.getTimeGrain().getDate();
                byRoomDate.computeIfAbsent(key, k -> new java.util.ArrayList<>()).add(a);
            }
            
            for (List<ShowtimeAssignment> roomAssignments : byRoomDate.values()) {
                for (int i = 0; i < roomAssignments.size(); i++) {
                    for (int j = i + 1; j < roomAssignments.size(); j++) {
                        ShowtimeAssignment a1 = roomAssignments.get(i);
                        ShowtimeAssignment a2 = roomAssignments.get(j);
                        
                        LocalTime s1Time = a1.getTimeGrain().getStart();
                        int s1Mins = s1Time.getHour() * 60 + s1Time.getMinute();
                        int dur1 = a1.getMovieRequest().getMovie().getDuration();
                        if (dur1 <= 0) dur1 = 120;
                        int e1Mins = s1Mins + dur1 + bufferMin;
                        
                        LocalTime s2Time = a2.getTimeGrain().getStart();
                        int s2Mins = s2Time.getHour() * 60 + s2Time.getMinute();
                        int dur2 = a2.getMovieRequest().getMovie().getDuration();
                        if (dur2 <= 0) dur2 = 120;
                        int e2Mins = s2Mins + dur2 + bufferMin;
                        
                        if (s1Mins < e2Mins && s2Mins < e1Mins) {
                            a1.addPlanningError("Xung đột giờ chiếu với " + a2.getMovieRequest().getMovieCode());
                            a2.addPlanningError("Xung đột giờ chiếu với " + a1.getMovieRequest().getMovieCode());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error validating schedule: " + e.getMessage());
            e.printStackTrace();
        }

        long assigned = solved.getAssignments().stream().filter(a -> a.getRoom() != null && a.getTimeGrain() != null).count();
        long unassigned = solved.getAssignments().stream().filter(a -> a.getRoom() == null || a.getTimeGrain() == null).count();
        System.out.println("Assigned: " + assigned);
        System.out.println("Unassigned: " + unassigned);
        
        return solved;
    }

    private int estimatePerDayQuota(MovieRequest r, int maxPerDay) {
        // Relaxed quota to allow high priority/demand movies to have more shows
        int base = 1; // Minimum 1 show/day
        Integer p = r.getPriority(); // usually 1-5
        Double d = r.getDemandScore(); // usually 0.0 - 1.0
        
        int pVal = p != null ? p : 0;
        int dVal = d != null ? (int)Math.round(d * 5) : 0;
        
        int extra = (pVal / 2) + (dVal / 2);
        return Math.min(maxPerDay, base + extra);
    }
}



