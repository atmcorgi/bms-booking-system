package fsa.training.repository.movie;

import fsa.training.entity.MovieRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface MovieRequestRepository extends JpaRepository<MovieRequest, Long>,
                                               JpaSpecificationExecutor<MovieRequest> {

    // Basic queries
    Optional<MovieRequest> findByMovieCode(String movieCode);

    @Query("SELECT mr FROM MovieRequest mr LEFT JOIN FETCH mr.movie WHERE mr.status = :status")
    List<MovieRequest> findByStatusWithMovie(@Param("status") String status);

    @Query("SELECT mr FROM MovieRequest mr LEFT JOIN FETCH mr.movie WHERE mr.status = :status")
    Page<MovieRequest> findByStatusWithMovie(@Param("status") String status, Pageable pageable);

    @EntityGraph(attributePaths = {"movie"})
    Page<MovieRequest> findByStatusAndTheater_Id(String status, Long theaterId, Pageable pageable);

    @EntityGraph(attributePaths = {"movie"})
    Optional<MovieRequest> findFirstByMovie_CodeAndTheater_Id(String movieCode, Long theaterId);

    @EntityGraph(attributePaths = {"movie"})
    Optional<MovieRequest> findByIdAndTheater_Id(Long id, Long theaterId);

    @EntityGraph(attributePaths = {"movie"})
    List<MovieRequest> findByStatusAndTheater_Id(String status, Long theaterId);

    @EntityGraph(attributePaths = {"movie"})
    List<MovieRequest> findByTheater_Id(Long theaterId);

    // Alias methods for cleaner code
    default List<MovieRequest> findByTheaterId(Long theaterId) {
        return findByTheater_Id(theaterId);
    }

    default List<MovieRequest> findByTheaterIdAndStatus(Long theaterId, String status) {
        return findByStatusAndTheater_Id(status, theaterId);
    }

}