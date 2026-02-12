package fsa.training.controller.movie;

import fsa.training.dto.movie.MovieSearchResultDTO;
import fsa.training.service.movie.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
public class MovieSearchApiController {

    @Autowired
    private MovieService movieService;

    @GetMapping("/search")
    public ResponseEntity<MovieSearchResultDTO> searchMovies(
            @RequestParam(value = "q", required = false) String searchTerm,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "year", required = false) String year,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        MovieSearchResultDTO results = movieService.searchAndCategorizeMovies(
            searchTerm, genre, year, page, size);
        
        return ResponseEntity.ok(results);
    }
}
