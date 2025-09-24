package fsa.training.controller.admin;

import fsa.training.entity.Genre;
import fsa.training.entity.Movie;
import fsa.training.repository.movie.GenreRepository;
import fsa.training.repository.movie.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/movies")
public class AdminMovieApiController {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GenreRepository genreRepository;

    @GetMapping
    public Map<String, Object> list(@RequestParam(value = "q", required = false) String q,
                                    @RequestParam(value = "page", defaultValue = "0") int page,
                                    @RequestParam(value = "size", defaultValue = "10") int size) {
        List<Movie> all = movieRepository.findAll();
        if (q != null && !q.isBlank()) {
            String qq = q.toLowerCase();
            all = all.stream()
                    .filter(m -> (m.getTitle() != null && m.getTitle().toLowerCase().contains(qq))
                            || (m.getCode() != null && m.getCode().toLowerCase().contains(qq)))
                    .collect(Collectors.toList());
        }
        int from = Math.max(0, Math.min(page * size, all.size()));
        int to = Math.max(from, Math.min(from + size, all.size()));
        List<Movie> slice = all.subList(from, to);
        int totalPages = (int) Math.ceil(all.size() / (double) size);
        return Map.of(
                "items", slice.stream().map(this::toMovie).collect(Collectors.toList()),
                "page", page,
                "size", size,
                "totalPages", totalPages,
                "totalItems", all.size()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            Movie movie = movieRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Movie not found"));
            return ResponseEntity.ok(toMovie(movie));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Movie m = new Movie();
            m.setTitle(String.valueOf(body.getOrDefault("title", "")));
            m.setCode(String.valueOf(body.getOrDefault("code", "")));
            Object dur = body.get("duration");
            if (dur != null) m.setDuration(Integer.valueOf(String.valueOf(dur)));
            Object release = body.get("releaseDate");
            if (release != null && !String.valueOf(release).isBlank()) {
                m.setReleaseDate(LocalDate.parse(String.valueOf(release)));
            }
            m.setDescription(String.valueOf(body.getOrDefault("description", "")));
            m.setDirector(String.valueOf(body.getOrDefault("director", "")));
            m.setActors(String.valueOf(body.getOrDefault("actors", "")));
            m.setAgeRating(String.valueOf(body.getOrDefault("ageRating", "")));
            m.setFormats(String.valueOf(body.getOrDefault("formats", "")));
            m.setLanguages(String.valueOf(body.getOrDefault("languages", "")));
            
            // Handle poster and trailer URLs
            m.setPosterUrl(String.valueOf(body.getOrDefault("posterUrl", "")));
            m.setTrailerUrl(String.valueOf(body.getOrDefault("trailerUrl", "")));

            // genres: array of names
            @SuppressWarnings("unchecked")
            List<String> genreNames = (List<String>) body.getOrDefault("genres", List.of());
            if (!genreNames.isEmpty()) {
                List<Genre> genres = genreRepository.findAll().stream()
                        .filter(g -> genreNames.contains(g.getName()))
                        .collect(Collectors.toList());
                m.setGenres(genres);
            }

            Movie saved = movieRepository.save(m);
            return ResponseEntity.created(URI.create("/api/admin/movies/" + saved.getId())).body(toMovie(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Movie m = movieRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Movie not found"));
            
            m.setTitle(String.valueOf(body.getOrDefault("title", m.getTitle())));
            m.setCode(String.valueOf(body.getOrDefault("code", m.getCode())));
            Object dur = body.get("duration");
            if (dur != null) m.setDuration(Integer.valueOf(String.valueOf(dur)));
            Object release = body.get("releaseDate");
            if (release != null && !String.valueOf(release).isBlank()) {
                m.setReleaseDate(LocalDate.parse(String.valueOf(release)));
            }
            m.setDescription(String.valueOf(body.getOrDefault("description", m.getDescription())));
            m.setDirector(String.valueOf(body.getOrDefault("director", m.getDirector())));
            m.setActors(String.valueOf(body.getOrDefault("actors", m.getActors())));
            m.setAgeRating(String.valueOf(body.getOrDefault("ageRating", m.getAgeRating())));
            m.setFormats(String.valueOf(body.getOrDefault("formats", m.getFormats())));
            m.setLanguages(String.valueOf(body.getOrDefault("languages", m.getLanguages())));
            
            // Handle poster and trailer URLs
            m.setPosterUrl(String.valueOf(body.getOrDefault("posterUrl", m.getPosterUrl())));
            m.setTrailerUrl(String.valueOf(body.getOrDefault("trailerUrl", m.getTrailerUrl())));

            // genres: array of names
            @SuppressWarnings("unchecked")
            List<String> genreNames = (List<String>) body.getOrDefault("genres", List.of());
            if (!genreNames.isEmpty()) {
                List<Genre> genres = genreRepository.findAll().stream()
                        .filter(g -> genreNames.contains(g.getName()))
                        .collect(Collectors.toList());
                m.setGenres(genres);
            }

            Movie saved = movieRepository.save(m);
            return ResponseEntity.ok(toMovie(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMovie(Movie m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("title", m.getTitle());
        map.put("code", m.getCode());
        map.put("duration", m.getDuration());
        map.put("releaseDate", m.getReleaseDate());
        map.put("description", m.getDescription());
        map.put("director", m.getDirector());
        map.put("actors", m.getActors());
        map.put("ageRating", m.getAgeRating());
        map.put("formats", m.getFormats());
        map.put("languages", m.getLanguages());
        map.put("status", m.getStatus());
        map.put("posterUrl", m.getPosterUrl());
        map.put("trailerUrl", m.getTrailerUrl());
        map.put("genres", m.getGenres() == null ? List.of() : m.getGenres().stream().map(Genre::getName).toList());
        return map;
    }

}


