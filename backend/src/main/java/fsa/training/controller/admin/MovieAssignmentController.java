package fsa.training.controller.admin;

import fsa.training.entity.Movie;
import fsa.training.entity.Theater;
import fsa.training.entity.MovieAssignment;
import fsa.training.service.movie.MovieService;
import fsa.training.service.movie.MovieAssignmentService;
import fsa.training.service.theater.TheaterService;
import fsa.training.observer.MovieAssignmentSubject;
import fsa.training.observer.MovieAssignmentState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/admin/movie-assignment")
public class MovieAssignmentController {

    @Autowired
    private MovieAssignmentService assignmentService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private TheaterService theaterService;
    
    @Autowired
    private MovieAssignmentSubject movieAssignmentSubject;
    

    @GetMapping
    public String assignmentForm(Model model) {
        List<Movie> movies = movieService.getAllMovies();
        List<Theater> theaters = theaterService.getAll();
        model.addAttribute("movies", movies);
        model.addAttribute("theaters", theaters);
        model.addAttribute("pageTitle", "Assign Movies to Theaters");
        return "admin/movie-assignment/form";
    }


    @PostMapping("/assign")
    public String assignMovie(@RequestParam Long movieId,
                             @RequestParam Long theaterId,
                             @RequestParam(required = false) String activeFrom,
                             @RequestParam(required = false) String activeTo,
                             @RequestParam(required = false) String formats,
                             @RequestParam(required = false) String languages,
                             RedirectAttributes ra) {
        try {
            LocalDate from = activeFrom != null && !activeFrom.isEmpty() ? LocalDate.parse(activeFrom) : LocalDate.now();
            LocalDate to = activeTo != null && !activeTo.isEmpty() ? LocalDate.parse(activeTo) : null;
            
            // Assign movie to theater
            assignmentService.assignMovieToTheater(movieId, theaterId, from, to, formats, languages);
            
            // Observer Pattern: Notify observers
            Movie movie = movieService.getMovieById(movieId).orElseThrow(() -> new RuntimeException("Movie not found"));
            Theater theater = theaterService.getById(theaterId).orElseThrow(() -> new RuntimeException("Theater not found"));
            String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            
            MovieAssignmentState state = new MovieAssignmentState(
                movieId, movie.getTitle(), theaterId, theater.getName(),
                adminUsername, LocalDateTime.now(), formats, languages
            );
            
            movieAssignmentSubject.setState(state);
            
            ra.addFlashAttribute("successMessage", "Successfully assigned movie to theater");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Failed to assign movie: " + e.getMessage());
        }
        return "redirect:/admin/movie-assignment/list";
    }

    @GetMapping("/list")
    public String listAssignments(Model model) {
        List<Theater> theaters = theaterService.getAll();
        // Get assignments for each theater
        java.util.Map<Long, java.util.List<MovieAssignment>> assignmentsByTheater = new java.util.HashMap<>();
        for (Theater theater : theaters) {
            List<MovieAssignment> assignments = assignmentService.findAssignmentsForTheater(theater.getId());
            assignmentsByTheater.put(theater.getId(), assignments);
        }
        
        model.addAttribute("theaters", theaters);
        model.addAttribute("assignmentsByTheater", assignmentsByTheater);
        model.addAttribute("pageTitle", "Movie Assignments");
        return "admin/movie-assignment/list";
    }
}
