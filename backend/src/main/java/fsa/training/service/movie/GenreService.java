package fsa.training.service.movie;

import fsa.training.entity.Genre;
import fsa.training.repository.movie.GenreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class GenreService {
    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }

    public Optional<Genre> getGenreById(Long id) {
        return genreRepository.findById(id);
    }

    public Optional<Genre> getGenreByName(String name) {
        return genreRepository.findByNameIgnoreCase(name);
    }

    public Genre createGenre(String name) {
        return genreRepository.findByNameIgnoreCase(name)
            .orElseGet(() -> {
                Genre genre = new Genre();
                genre.setName(name);
                return genreRepository.save(genre);
            });
    }

    public Genre saveGenre(Genre genre) {
        return genreRepository.save(genre);
    }

    public void deleteGenre(Long id) {
        genreRepository.findById(id)
            .ifPresent(genre -> {
                genre.setDeleted(true);
                genreRepository.save(genre);
            });
    }

    public List<Genre> searchGenres(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllGenres();
        }
        return genreRepository.findByNameContainingIgnoreCase(query.trim());
    }

    public Page<Genre> searchGenres(String query, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        if (query == null || query.trim().isEmpty()) {
            return genreRepository.findAll(pageable);
        }
        return genreRepository.findByNameContainingIgnoreCase(query.trim(), pageable);
    }

    public Page<Genre> getDeletedGenres(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return genreRepository.findByDeletedTrue(pageable);
    }

    public void restoreGenre(Long id) {
        genreRepository.findById(id)
            .ifPresent(genre -> {
                genre.setDeleted(false);
                genreRepository.save(genre);
            });
    }
}
