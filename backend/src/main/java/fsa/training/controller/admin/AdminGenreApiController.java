package fsa.training.controller.admin;

import fsa.training.entity.Genre;
import fsa.training.service.movie.GenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/genres")
public class AdminGenreApiController {

    @Autowired
    private GenreService genreService;

    @GetMapping
    public Map<String, Object> list(@RequestParam(value = "q", required = false) String q,
                                    @RequestParam(value = "page", defaultValue = "0") int page,
                                    @RequestParam(value = "size", defaultValue = "10") int size) {
        Page<Genre> pageData = genreService.searchGenres(q, page, size);
        return Map.of(
                "items", pageData.getContent(),
                "page", pageData.getNumber(),
                "size", pageData.getSize(),
                "totalPages", pageData.getTotalPages(),
                "totalItems", pageData.getTotalElements()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return genreService.getGenreById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Genre genre) {
        Genre saved = genreService.saveGenre(genre);
        return ResponseEntity.created(URI.create("/api/admin/genres/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Genre genre) {
        genre.setId(id);
        Genre saved = genreService.saveGenre(genre);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restore(@PathVariable Long id) {
        genreService.restoreGenre(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}


