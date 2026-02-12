package fsa.training.controller.admin;

import fsa.training.entity.Genre;
import fsa.training.repository.movie.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/genres")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminGenreApiController {

    @Autowired
    private GenreRepository genreRepository;

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        List<Genre> all = genreRepository.findAll();
        
        // Filter by search query
        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase();
            all = all.stream()
                    .filter(g -> g.getName() != null && g.getName().toLowerCase().contains(query))
                    .collect(Collectors.toList());
        }
        
        // Apply pagination
        int from = Math.max(0, Math.min(page * size, all.size()));
        int to = Math.max(from, Math.min(from + size, all.size()));
        List<Genre> slice = all.subList(from, to);
        int totalPages = (int) Math.ceil(all.size() / (double) size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", slice);
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", totalPages);
        response.put("totalItems", all.size());
        
        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Genre> getById(@PathVariable Long id) {
        return genreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Genre> create(@RequestBody Genre genre) {
        if (genre.getName() == null || genre.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Check if genre with same name already exists
        if (genreRepository.findByNameIgnoreCase(genre.getName()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        
        Genre saved = genreRepository.save(genre);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Genre> update(@PathVariable Long id, @RequestBody Genre genre) {
        return genreRepository.findById(id)
                .map(existing -> {
                    if (genre.getName() != null && !genre.getName().trim().isEmpty()) {
                        existing.setName(genre.getName());
                    }
                    if (genre.getDescription() != null) {
                        existing.setDescription(genre.getDescription());
                    }
                    Genre updated = genreRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return genreRepository.findById(id)
                .map(genre -> {
                    genre.setDeleted(true);
                    genreRepository.save(genre);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Genre> restore(@PathVariable Long id) {
        return genreRepository.findById(id)
                .map(genre -> {
                    genre.setDeleted(false);
                    Genre restored = genreRepository.save(genre);
                    return ResponseEntity.ok(restored);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

