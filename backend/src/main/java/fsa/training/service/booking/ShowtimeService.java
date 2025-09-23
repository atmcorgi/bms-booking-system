package fsa.training.service.booking;

import fsa.training.entity.Showtime;
import fsa.training.specification.ShowtimeSpecification;
import fsa.training.repository.booking.ShowtimeRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;

@Service
public class ShowtimeService {
    private final ShowtimeRepository showtimeRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    public Optional<Showtime> getById(Long id) { return showtimeRepository.findById(id); }

    public List<Showtime> findByMovieIdAndTheaterId(Long movieId, Long theaterId) {
        Specification<Showtime> spec = ShowtimeSpecification.withMovie(movieId)
            .and(ShowtimeSpecification.withTheater(theaterId));
        return showtimeRepository.findAll(spec);
    }
    public List<Showtime> findByTheaterId(Long theaterId) {
        Specification<Showtime> spec = ShowtimeSpecification.withTheater(theaterId);
        return showtimeRepository.findAll(spec);
    }
    
    // Complex queries using multiple specifications
    public List<Showtime> findAvailableShowtimes(Long movieId, Long theaterId, java.time.LocalDate date) {
        Specification<Showtime> spec = ShowtimeSpecification.withMovie(movieId)
            .and(ShowtimeSpecification.withTheater(theaterId))
            .and(ShowtimeSpecification.withShowDate(date));
        
        return showtimeRepository.findAll(spec);
    }
} 