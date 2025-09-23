package fsa.training.controller.movie;

import fsa.training.entity.Movie;
import fsa.training.entity.Genre;
import fsa.training.service.movie.MovieService;
import fsa.training.service.movie.GenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/movies")
public class MovieController {
    @Autowired
    private MovieService movieService;
    @Autowired
    private GenreService genreService;

    @GetMapping("/{id}")
    public String movieDetail(@PathVariable Long id,
                             @RequestParam(required = false) Boolean autoBook,
                             Model model) {
        return movieService.getMovieById(id)
            .map(movie -> {
                model.addAttribute("movie", movie);
                if (autoBook != null && autoBook) {
                    model.addAttribute("autoBook", true);
                }
                return "movie/movie-detail-new";
            })
            .orElse("redirect:/");
    }

    @GetMapping("/api/genres")
    public ResponseEntity<?> getGenres() {
        List<Genre> genres = genreService.getAllGenres();
        List<String> genreNames = genres.stream()
            .map(Genre::getName)
            .sorted()
            .toList();
        
        return ResponseEntity.ok(genreNames);
    }

    @GetMapping("/search")
    public String searchMovies(@RequestParam(required = false) String keyword,
                              @RequestParam(required = false) String genre,
                              @RequestParam(required = false) String year,
                              Model model) {
        List<Movie> searchResults = movieService.searchMoviesWithFilters(keyword, genre, year);
        model.addAttribute("movies", searchResults);
        model.addAttribute("searchQuery", keyword);
        model.addAttribute("activeFilters", Map.of(
            "genre", genre != null ? genre : "",
            "year", year != null ? year : ""
        ));
        model.addAttribute("title", "Kết quả tìm kiếm" + (keyword != null ? ": " + keyword : ""));
        return "movie/movie-search";
    }
}