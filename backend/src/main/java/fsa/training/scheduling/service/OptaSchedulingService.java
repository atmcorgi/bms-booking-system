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

    public TheaterScheduleSolution solve(Long theaterId, LocalDate start, LocalDate end, List<String> filterCodes) {
        List<Room> rooms = roomRepository.findByTheaterId(theaterId);
        List<RoomResource> roomFacts = rooms.stream().map(RoomResource::from).collect(Collectors.toList());

        List<TimeGrain> timeFacts = new ArrayList<>();
        LocalDate d = start;
        while (!d.isAfter(end)) {
            // Candidate times: early morning + off-peak + shoulder + prime
            LocalTime open = LocalTime.of(8, 0);  // Bắt đầu từ 8:00
            LocalTime close = LocalTime.of(23, 0);
            for (LocalTime t = open; !t.isAfter(close); t = t.plusMinutes(30)) {
                timeFacts.add(new TimeGrain(d, t));
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
                int perDayQuota = estimatePerDayQuota(r);
                for (int i = 0; i < perDayQuota; i++) {
                    ShowtimeAssignment a = new ShowtimeAssignment();
                    a.setId(idSeq++);
                    a.setMovieRequest(r);
                    // timeGrain will be chosen by solver
                    assignments.add(a);
                }
            }
            day = day.plusDays(1);
        }

        TheaterScheduleSolution problem = new TheaterScheduleSolution(roomFacts, timeFacts, assignments);

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
        
        // Debug logs will be shown AFTER solver completes
        
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
        
        long assigned = solved.getAssignments().stream().filter(a -> a.getRoom() != null && a.getTimeGrain() != null).count();
        long unassigned = solved.getAssignments().stream().filter(a -> a.getRoom() == null || a.getTimeGrain() == null).count();
        System.out.println("Assigned: " + assigned);
        System.out.println("Unassigned: " + unassigned);
        
        // Log unassigned assignments
        if (unassigned > 0) {
            System.out.println("=== UNASSIGNED ASSIGNMENTS ===");
            solved.getAssignments().stream()
                .filter(a -> a.getRoom() == null || a.getTimeGrain() == null)
                .forEach(a -> System.out.println("INVALID Assignment: Room=" + a.getRoom() + 
                    ", Time=" + (a.getTimeGrain() != null ? a.getTimeGrain().getStart() : null) + 
                    ", Movie=" + (a.getMovieRequest() != null ? a.getMovieRequest().getMovie().getCode() : "NULL")));
        }
        
        // Log successful assignments
        if (assigned > 0) {
            System.out.println("=== SUCCESSFUL ASSIGNMENTS ===");
            solved.getAssignments().stream()
                .filter(a -> a.getRoom() != null && a.getTimeGrain() != null)
                .limit(10) // Show first 10 assignments
                .forEach(a -> System.out.println("SUCCESS: Room " + a.getRoom().getId() + 
                    ", Time " + a.getTimeGrain().getStart() + 
                    ", Movie " + a.getMovieRequest().getMovie().getCode() +
                    ", Duration " + a.getMovieRequest().getMovie().getDuration()));
        }
        
        return solved;
    }

    private int estimatePerDayQuota(MovieRequest r) {
        // Reduce quota to avoid overloading solver
        int base = 1; // tối thiểu 1 suất/ngày khi đã chọn
        Integer p = r.getPriority();
        Double d = r.getDemandScore();
        int add = 0;
        if (p != null) add += Math.min(1, Math.max(0, p / 3)); // Reduce from p/2 to p/3
        if (d != null) add += Math.min(1, (int)Math.round(d / 2)); // Reduce from d to d/2
        int quota = Math.max(1, Math.min(2, base + add)); // Max 2 instead of 3
        return quota;
    }
}


