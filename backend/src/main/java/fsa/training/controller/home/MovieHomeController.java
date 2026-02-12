package fsa.training.controller.home;

import fsa.training.dto.movie.MovieCardProjection;
import fsa.training.service.movie.MovieService;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.HashMap;
import java.util.Map;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api")
public class MovieHomeController {
    private final MovieService movieService;

    public MovieHomeController(MovieService movieService) {
        this.movieService = movieService;
    }

    
    // API for Load More - Now Showing
    @GetMapping("/movies/now-showing")
    @Transactional(readOnly = true)
    public Map<String, Object> loadMoreNowShowing(@RequestParam(defaultValue = "0") int page) {
        Page<MovieCardProjection> moviePage = movieService.getNowShowingProjections(page, 8);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", moviePage.getContent());
        response.put("hasMore", !moviePage.isLast());
        response.put("page", page);
        response.put("totalPages", moviePage.getTotalPages());
        response.put("totalItems", moviePage.getTotalElements());
        response.put("size", moviePage.getSize());
        
        return response;
    }
    
    // API for Load More - Coming Soon
    @GetMapping("/movies/coming-soon")
    @Transactional(readOnly = true)
    public Map<String, Object> loadMoreComingSoon(@RequestParam(defaultValue = "0") int page) {
        Page<MovieCardProjection> moviePage = movieService.getComingSoonProjections(page, 8);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", moviePage.getContent());
        response.put("hasMore", !moviePage.isLast());
        response.put("page", page);
        response.put("totalPages", moviePage.getTotalPages());
        response.put("totalItems", moviePage.getTotalElements());
        response.put("size", moviePage.getSize());
        
        return response;
    }
}

