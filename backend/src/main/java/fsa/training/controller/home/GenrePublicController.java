package fsa.training.controller.home;

import fsa.training.repository.movie.GenreRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/genres")
public class GenrePublicController {
    
    private final GenreRepository genreRepository;

    public GenrePublicController(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @GetMapping
    public List<String> getAllGenreNames() {
        return genreRepository.findAll().stream()
                .filter(g -> !g.isDeleted())
                .map(g -> g.getName())
                .sorted()
                .collect(Collectors.toList());
    }
}
