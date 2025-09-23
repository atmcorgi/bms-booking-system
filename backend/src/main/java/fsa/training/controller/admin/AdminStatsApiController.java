package fsa.training.controller.admin;

import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.GenreRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.theater.RoomRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsApiController {
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;

    public AdminStatsApiController(MovieRepository movieRepository,
                                   GenreRepository genreRepository,
                                   TheaterRepository theaterRepository,
                                   RoomRepository roomRepository) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.theaterRepository = theaterRepository;
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public Map<String, Object> totals() {
        return Map.of(
                "movies", movieRepository.count(),
                "genres", genreRepository.count(),
                "theaters", theaterRepository.count(),
                "rooms", roomRepository.count()
        );
    }
}


