package fsa.training.service.movie;

import fsa.training.entity.Movie;
import fsa.training.entity.MovieAssignment;
import fsa.training.entity.Theater;
import fsa.training.repository.movie.MovieAssignmentRepository;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.service.theater.TheaterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MovieAssignmentService {

    private final MovieAssignmentRepository assignmentRepository;
    private final MovieRepository movieRepository;
    private final TheaterService theaterService;

    public MovieAssignmentService(MovieAssignmentRepository assignmentRepository,
                                  MovieRepository movieRepository,
                                  TheaterService theaterService) {
        this.assignmentRepository = assignmentRepository;
        this.movieRepository = movieRepository;
        this.theaterService = theaterService;
    }

    @Transactional
    public MovieAssignment assignMovieToTheater(Long movieId, Long theaterId, LocalDate from, LocalDate to, String formats, String languages) {
        if (assignmentRepository.existsByMovie_IdAndTheater_Id(movieId, theaterId)) {
            // already assigned → update window/options
            MovieAssignment existing = assignmentRepository.findAll().stream()
                    .filter(a -> a.getMovie().getId().equals(movieId) && a.getTheater().getId().equals(theaterId))
                    .findFirst().orElse(null);
        
            if (existing != null) {
                existing.setActiveFrom(from);
                existing.setActiveTo(to);
                existing.setFormats(formats);
                existing.setLanguages(languages);
                return assignmentRepository.save(existing);
            }
        }

        Movie movie = movieRepository.findById(movieId).orElseThrow(() -> new RuntimeException("Movie not found with id: " + movieId));
        Theater theater = theaterService.getById(theaterId).orElseThrow(() -> new RuntimeException("Theater not found with id: " + theaterId));
        MovieAssignment a = new MovieAssignment();
        a.setMovie(movie);
        a.setTheater(theater);
        a.setActiveFrom(from);
        a.setActiveTo(to);
        a.setFormats(formats);
        a.setLanguages(languages);
        return assignmentRepository.save(a);
    }

    @Transactional(readOnly = true)
    public List<MovieAssignment> findAssignmentsForTheater(Long theaterId) {
        return assignmentRepository.findByTheater_IdWithDetails(theaterId);
    }
}


