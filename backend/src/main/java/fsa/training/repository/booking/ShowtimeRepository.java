package fsa.training.repository.booking;

import fsa.training.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long>, JpaSpecificationExecutor<Showtime> {
    

    Optional<Showtime> findByRoomIdAndShowDateAndShowTime(Long roomId, LocalDate showDate, LocalTime showTime);

    /**
     * Find all showtimes for a specific room on a specific date
     * Used for conflict detection when scheduling new showtimes
     */
    List<Showtime> findByRoomIdAndShowDate(Long roomId, LocalDate showDate);

    /**
     * Find existing showtimes for multiple theaters on a specific date
     */
    @Query("SELECT s FROM Showtime s WHERE s.theater.id IN :theaterIds AND s.showDate = :showDate")
    List<Showtime> findByTheaterIdsAndShowDate(@Param("theaterIds") List<Long> theaterIds, 
                                              @Param("showDate") LocalDate showDate);

    /**
     * Find existing showtimes for a specific theater, movie, date and time
     */
    @Query("SELECT s FROM Showtime s WHERE s.theater.id = :theaterId AND s.movie.id = :movieId AND s.showDate = :showDate AND s.showTime = :showTime")
    List<Showtime> findByTheaterIdAndMovieIdAndShowDateAndShowTime(@Param("theaterId") Long theaterId,
                                                                  @Param("movieId") Long movieId,
                                                                  @Param("showDate") LocalDate showDate,
                                                                  @Param("showTime") LocalTime showTime);

    /**
     * Find all showtimes for a theater on a specific date
     */
    @Query("SELECT s FROM Showtime s WHERE s.theater.name = :theaterName AND s.showDate = :showDate ORDER BY s.showTime")
    List<Showtime> findByTheaterNameAndShowDate(@Param("theaterName") String theaterName,
                                               @Param("showDate") LocalDate showDate);
    long countByTheaterId(Long theaterId);
    
    List<Showtime> findByTheaterIdOrderByShowDateDescShowTimeDesc(Long theaterId);

    @Query("SELECT s FROM Showtime s WHERE s.theater.id = :theaterId " +
           "AND (:roomId IS NULL OR s.room.id = :roomId) " +
           "AND (:startDate IS NULL OR s.showDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.showDate <= :endDate)")
    Page<Showtime> findShowtimes(@Param("theaterId") Long theaterId, 
                                 @Param("roomId") Long roomId,
                                 @Param("startDate") LocalDate startDate, 
                                 @Param("endDate") LocalDate endDate, 
                                 Pageable pageable);

    // ============ OPTIMIZED QUERIES FOR BOOKING FLOW ============
    
    /**
     * Find all showtimes for a theater (with optional movie filter)
     */
    @Query("SELECT DISTINCT s FROM Showtime s " +
           "LEFT JOIN FETCH s.movie " +
           "LEFT JOIN FETCH s.room " +
           "WHERE s.theater.id = :theaterId " +
           "AND (:movieId IS NULL OR s.movie.id = :movieId) " +
           "AND s.showDate >= :startDate " +
           "ORDER BY s.showDate, s.showTime")
    List<Showtime> findByTheaterIdAndMovieIdFromDate(@Param("theaterId") Long theaterId,
                                                      @Param("movieId") Long movieId,
                                                      @Param("startDate") LocalDate startDate);

    /**
     * Find distinct showdates for a theater (with optional movie filter)
     */
    @Query("SELECT DISTINCT s.showDate FROM Showtime s " +
           "WHERE s.theater.id = :theaterId " +
           "AND (:movieId IS NULL OR s.movie.id = :movieId) " +
           "AND s.showDate >= :startDate " +
           "ORDER BY s.showDate")
    List<LocalDate> findDistinctShowDatesByTheaterIdAndMovieIdFromDate(@Param("theaterId") Long theaterId,
                                                                       @Param("movieId") Long movieId,
                                                                       @Param("startDate") LocalDate startDate);

    /**
     * Find showtimes for a theater, movie, and date
     */
    @Query("SELECT DISTINCT s FROM Showtime s " +
           "LEFT JOIN FETCH s.movie " +
           "LEFT JOIN FETCH s.room " +
           "WHERE s.theater.id = :theaterId " +
           "AND s.movie.id = :movieId " +
           "AND s.showDate = :showDate " +
           "ORDER BY s.showTime")
    List<Showtime> findByTheaterIdAndMovieIdAndShowDate(@Param("theaterId") Long theaterId,
                                                          @Param("movieId") Long movieId,
                                                          @Param("showDate") LocalDate showDate);
}