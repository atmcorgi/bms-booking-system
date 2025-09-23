package fsa.training.controller.home;

import fsa.training.dto.movie.MovieCardProjection;
import fsa.training.service.movie.MovieService;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.HashMap;
import java.util.Map;
import org.springframework.data.domain.Page;

@Controller
public class HomeController {
    private final MovieService movieService;

    public HomeController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping({"/", "/home"})
    @Transactional(readOnly = true)
    public String home(Model model) {
        
        // Load initial 8 movies for each category using optimized projections
        Page<MovieCardProjection> nowShowingPage = movieService.getNowShowingProjections(0, 8);
        Page<MovieCardProjection> comingSoonPage = movieService.getComingSoonProjections(0, 8);
        
        model.addAttribute("nowShowingMovies", nowShowingPage.getContent());
        model.addAttribute("comingSoonMovies", comingSoonPage.getContent());
        model.addAttribute("nowShowingHasMore", !nowShowingPage.isLast());
        model.addAttribute("comingSoonHasMore", !comingSoonPage.isLast());
        model.addAttribute("title", "My Cinema - Trang chủ");
        return "home/home-new";
    }
    
    // API for Load More - Now Showing
    @GetMapping("/api/movies/now-showing")
    @ResponseBody
    @Transactional(readOnly = true)
    public Map<String, Object> loadMoreNowShowing(@RequestParam(defaultValue = "0") int page) {
        Page<MovieCardProjection> moviePage = movieService.getNowShowingProjections(page, 8);
        
        Map<String, Object> response = new HashMap<>();
        response.put("movies", moviePage.getContent());
        response.put("hasMore", !moviePage.isLast());
        response.put("currentPage", page);
        response.put("totalPages", moviePage.getTotalPages());
        
        return response;
    }
    
    // API for Load More - Coming Soon
    @GetMapping("/api/movies/coming-soon")
    @ResponseBody
    @Transactional(readOnly = true)
    public Map<String, Object> loadMoreComingSoon(@RequestParam(defaultValue = "0") int page) {
        Page<MovieCardProjection> moviePage = movieService.getComingSoonProjections(page, 8);
        
        Map<String, Object> response = new HashMap<>();
        response.put("movies", moviePage.getContent());
        response.put("hasMore", !moviePage.isLast());
        response.put("currentPage", page);
        response.put("totalPages", moviePage.getTotalPages());
        
        return response;
    }
}