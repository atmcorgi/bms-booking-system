package fsa.training.controller.movie;

import fsa.training.dto.movie.MovieCardProjection;
import fsa.training.service.movie.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
public class MovieSearchApiController {

    @Autowired
    private MovieService movieService;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchMovies(
            @RequestParam(value = "q", required = false) String searchTerm,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "year", required = false) String year,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        try {
            Page<MovieCardProjection> movies = movieService.searchMovies(
                searchTerm, genre, year, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("movies", movies.getContent());
            response.put("page", page);
            response.put("size", size);
            response.put("totalPages", movies.getTotalPages());
            response.put("totalItems", movies.getTotalElements());
            response.put("hasMore", !movies.isLast());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tìm kiếm phim: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
