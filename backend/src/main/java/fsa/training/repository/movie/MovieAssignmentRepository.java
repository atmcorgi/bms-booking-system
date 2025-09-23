package fsa.training.repository.movie;

import fsa.training.entity.MovieAssignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieAssignmentRepository extends JpaRepository<MovieAssignment, Long> {
    List<MovieAssignment> findByTheater_Id(Long theaterId);
    boolean existsByMovie_IdAndTheater_Id(Long movieId, Long theaterId);

    @Query("SELECT ma FROM MovieAssignment ma JOIN FETCH ma.movie JOIN FETCH ma.theater WHERE ma.theater.id = :theaterId")
    List<MovieAssignment> findByTheater_IdWithDetails(@Param("theaterId") Long theaterId);

    // Alias for legacy controllers
    @Query("SELECT ma FROM MovieAssignment ma JOIN FETCH ma.movie WHERE ma.theater.id = :theaterId")
    List<MovieAssignment> findAllWithMovieByTheater(@Param("theaterId") Long theaterId);

    Optional<MovieAssignment> findFirstByTheater_IdAndMovie_Id(Long theaterId, Long movieId);
}


