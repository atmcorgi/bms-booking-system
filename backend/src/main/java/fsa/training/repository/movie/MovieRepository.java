package fsa.training.repository.movie;

import fsa.training.entity.Movie;
import fsa.training.dto.movie.MovieCardProjection;
import fsa.training.dto.movie.MovieStatusProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {

    @Query("SELECT DISTINCT m FROM Movie m JOIN m.showtimes s WHERE s.theater.id = :theaterId AND s.showDate >= :start")
    List<Movie> findMoviesByTheaterIdFromDate(@Param("theaterId") Long theaterId,
                                              @Param("start") LocalDate start);

    @Query(value = "SELECT DISTINCT m.* FROM movie m " +
            "JOIN movie_request mr ON m.id = mr.movie_id " +
            "JOIN showtime s ON m.id = s.movie_id " +
            "WHERE s.theater_id = :theaterId " +
            "AND s.show_date >= :start " +
            "AND mr.status = 'PUBLISHED'", nativeQuery = true)
    List<Movie> findNowShowingMoviesByTheater(@Param("theaterId") Long theaterId, @Param("start") LocalDate start);


    Optional<Movie> findByCode(String code);

    // Projection queries

    @Query(value = "SELECT m.id as id, m.title as title, m.poster_url as posterUrl, " +
           "m.duration as duration, m.age_rating as ageRating, m.release_date as releaseDate, " +
           "m.director as director, COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres " +
           "FROM movie m " +
           "JOIN movie_request mr ON m.id = mr.movie_id " +
           "LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id " +
           "WHERE mr.status = 'PUBLISHED' " +
           "AND EXISTS (SELECT 1 FROM showtime s WHERE s.movie_id = m.id AND s.show_date >= :today) " +
           "GROUP BY m.id, m.title, m.poster_url, m.duration, m.age_rating, m.release_date, m.director " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieCardProjection> findNowShowingProjections(Pageable pageable, @Param("today") LocalDate today);

    @Query(value = "SELECT m.id as id, m.title as title, m.poster_url as posterUrl, " +
           "m.duration as duration, m.age_rating as ageRating, m.release_date as releaseDate, " +
           "m.director as director, COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres " +
           "FROM movie m " +
           "LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id " +
           "WHERE m.release_date > :today " +
           "GROUP BY m.id, m.title, m.poster_url, m.duration, m.age_rating, m.release_date, m.director " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieCardProjection> findComingSoonProjections(Pageable pageable, @Param("today") LocalDate today);

    @Query(value = "SELECT m.id as id, m.code as code, m.title as title, m.director as director, " +
           "m.duration as duration, m.status as status, m.release_date as releaseDate, " +
           "COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres, COUNT(s.id) as showtimeCount " +
           "FROM movie m LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id LEFT JOIN showtime s ON m.id = s.movie_id " +
           "WHERE m.status = :status " +
           "GROUP BY m.id, m.code, m.title, m.director, m.duration, m.status, m.release_date " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieStatusProjection> findWorkflowProjectionsByStatus(@Param("status") String status, Pageable pageable);

    @Query(value = "SELECT COUNT(DISTINCT m.id) FROM movie m WHERE m.status = :status", nativeQuery = true)
    long countMoviesByStatus(@Param("status") String status);

    // Assignment-based projections and counts (shared movie model)
    @Query(value = "SELECT m.id as id, m.code as code, m.title as title, m.director as director, " +
           "m.duration as duration, m.status as status, m.release_date as releaseDate, " +
           "COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres, COUNT(s.id) as showtimeCount " +
           "FROM movie_assignment ma JOIN movie m ON ma.movie_id = m.id " +
           "LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id LEFT JOIN showtime s ON m.id = s.movie_id AND s.theater_id = ma.theater_id " +
           "WHERE m.status = :status AND ma.theater_id = :theaterId " +
           "GROUP BY m.id, m.code, m.title, m.director, m.duration, m.status, m.release_date " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieStatusProjection> findWorkflowProjectionsByStatusAndTheater(@Param("status") String status,
                                                                          @Param("theaterId") Long theaterId,
                                                                          Pageable pageable);

    @Query(value = "SELECT COUNT(DISTINCT m.id) FROM movie_assignment ma JOIN movie m ON ma.movie_id = m.id WHERE m.status = :status AND ma.theater_id = :theaterId", nativeQuery = true)
    long countMoviesByStatusAndTheater(@Param("status") String status, @Param("theaterId") Long theaterId);

    @Query(value = "SELECT COUNT(DISTINCT m.id) FROM movie_assignment ma JOIN movie m ON ma.movie_id = m.id WHERE ma.theater_id = :theaterId AND m.status = 'DRAFT'", nativeQuery = true)
    int countAssignedMoviesByTheater(@Param("theaterId") Long theaterId);

    @Query(value = "SELECT m.id as id, m.title as title, m.poster_url as posterUrl, " +
           "m.duration as duration, m.age_rating as ageRating, m.release_date as releaseDate, " +
           "m.director as director, COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres " +
           "FROM movie m " +
           "LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id " +
           "WHERE m.status = 'PUBLISHED' " +
           "GROUP BY m.id, m.title, m.poster_url, m.duration, m.age_rating, m.release_date, m.director " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieCardProjection> searchMoviesProjection(Pageable pageable);

    @Query(value = "SELECT m.id as id, m.code as code, m.title as title, m.director as director, " +
           "m.duration as duration, m.status as status, m.release_date as releaseDate, " +
           "COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres, 0 as showtimeCount, " +
           "COALESCE(ma.formats, '2D') as formats, COALESCE(ma.languages, 'VI') as languages " +
           "FROM movie_assignment ma JOIN movie m ON ma.movie_id = m.id " +
           "LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id " +
           "WHERE ma.theater_id = :theaterId AND m.status = 'DRAFT' " +
           "GROUP BY m.id, m.code, m.title, m.director, m.duration, m.status, m.release_date, ma.formats, ma.languages " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieStatusProjection> findAssignedMoviesByTheater(@Param("theaterId") Long theaterId, Pageable pageable);

    @Query(value = "SELECT m.id as id, m.code as code, m.title as title, m.director as director, " +
           "m.duration as duration, m.status as status, m.release_date as releaseDate, " +
           "COALESCE(GROUP_CONCAT(DISTINCT g.name SEPARATOR ', '), '') as genres, 0 as showtimeCount, " +
           "COALESCE(ma.formats, '2D') as formats, COALESCE(ma.languages, 'VI') as languages " +
           "FROM movie_assignment ma JOIN movie m ON ma.movie_id = m.id " +
           "LEFT JOIN movie_genre mg ON m.id = mg.movie_id " +
           "LEFT JOIN genre g ON mg.genre_id = g.id " +
           "WHERE ma.theater_id = :theaterId " +
           "GROUP BY m.id, m.code, m.title, m.director, m.duration, m.status, m.release_date, ma.formats, ma.languages " +
           "ORDER BY m.title ASC", nativeQuery = true)
    Page<MovieStatusProjection> findAllAssignedMoviesByTheater(@Param("theaterId") Long theaterId, Pageable pageable);
    @Query(value = "SELECT m.* FROM movie m " +
            "WHERE (:q IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(m.code) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "AND NOT EXISTS (SELECT 1 FROM movie_assignment ma WHERE ma.movie_id = m.id AND ma.theater_id = :theaterId) " +
            "ORDER BY m.title ASC",
            countQuery = "SELECT count(m.id) FROM movie m " +
            "WHERE (:q IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(m.code) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "AND NOT EXISTS (SELECT 1 FROM movie_assignment ma WHERE ma.movie_id = m.id AND ma.theater_id = :theaterId)",
            nativeQuery = true)
    Page<Movie> findUnassignedMoviesByTheater(@Param("theaterId") Long theaterId, @Param("q") String q, Pageable pageable);
}