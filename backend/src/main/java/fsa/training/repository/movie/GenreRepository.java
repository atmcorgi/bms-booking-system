package fsa.training.repository.movie;

import fsa.training.entity.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {

    Optional<Genre> findByNameIgnoreCase(String name);

    List<Genre> findByNameContainingIgnoreCase(String name);
    Page<Genre> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Genre> findByDeletedTrue(Pageable pageable);
}