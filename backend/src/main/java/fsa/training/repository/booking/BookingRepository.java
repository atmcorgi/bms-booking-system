package fsa.training.repository.booking;

import fsa.training.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByShowtimeId(Long showtimeId);
    List<Booking> findByPaymentCode(String paymentCode);
    List<Booking> findByAccountId(Long accountId);

    @Query("select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.id in :ids")
    List<Booking> getByIds(@Param("ids") List<Long> ids);

    long countByShowtime_Theater_Id(Long theaterId);

    @Query("select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.movie m " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.account.id = :accountId " +
           "order by b.bookingTime desc")
    List<Booking> findByAccountIdWithDetails(@Param("accountId") Long accountId);

    List<Booking> findByStatusAndBookingTimeBefore(String status, java.time.Instant time);
    
    // Pagination support
    @Query(value = "select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.movie m " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.account.id = :accountId " +
           "order by b.bookingTime desc",
           countQuery = "select count(b) from Booking b where b.account.id = :accountId")
    org.springframework.data.domain.Page<Booking> findByAccountIdWithDetails(@Param("accountId") Long accountId, org.springframework.data.domain.Pageable pageable);

    @Query(value = "select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.movie m " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.account.id = :accountId and b.status = :status " +
           "order by b.bookingTime desc",
           countQuery = "select count(b) from Booking b where b.account.id = :accountId and b.status = :status")
    org.springframework.data.domain.Page<Booking> findByAccountIdAndStatusWithDetails(@Param("accountId") Long accountId, @Param("status") String status, org.springframework.data.domain.Pageable pageable);

    // Statistics
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.showtime s " +
           "LEFT JOIN FETCH s.movie m " +
           "LEFT JOIN FETCH b.seat seat " +
           "WHERE b.status = :status AND b.bookingTime BETWEEN :start AND :end")
    List<Booking> findByStatusAndBookingTimeBetween(@Param("status") String status, @Param("start") java.time.Instant start, @Param("end") java.time.Instant end);

    @Query("SELECT s.movie, COUNT(b.id) FROM Booking b JOIN b.showtime s WHERE b.status = 'PAID' GROUP BY s.movie ORDER BY COUNT(b.id) DESC")
    List<Object[]> findTopMoviesByBookingCount(org.springframework.data.domain.Pageable pageable);

    // Statistics with filter
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.showtime s " +
           "LEFT JOIN FETCH s.movie m " +
           "LEFT JOIN FETCH b.seat seat " +
           "LEFT JOIN FETCH s.theater t " +
           "WHERE b.status = :status AND b.bookingTime BETWEEN :start AND :end AND t.id = :theaterId")
    List<Booking> findByStatusAndBookingTimeBetweenAndTheaterId(@Param("status") String status, 
                                                               @Param("start") java.time.Instant start, 
                                                               @Param("end") java.time.Instant end,
                                                               @Param("theaterId") Long theaterId);

    @Query("SELECT s.movie, COUNT(b.id) FROM Booking b JOIN b.showtime s JOIN s.theater t " +
           "WHERE b.status = 'PAID' AND t.id = :theaterId " +
           "GROUP BY s.movie ORDER BY COUNT(b.id) DESC")
    List<Object[]> findTopMoviesByBookingCountAndTheater(@Param("theaterId") Long theaterId, org.springframework.data.domain.Pageable pageable);

    // Theater revenue breakdown - for ADMIN insights
    @Query("SELECT s.theater.id, s.theater.name, SUM(CASE WHEN seat.seatType = 'VIP' THEN s.priceVip WHEN seat.seatType = 'COUPLE' THEN s.priceStandard * 2 ELSE s.priceStandard END), COUNT(b.id) " +
           "FROM Booking b JOIN b.showtime s JOIN b.seat seat " +
           "WHERE b.status = 'PAID' AND b.bookingTime BETWEEN :start AND :end " +
           "GROUP BY s.theater.id, s.theater.name " +
           "ORDER BY SUM(CASE WHEN seat.seatType = 'VIP' THEN s.priceVip WHEN seat.seatType = 'COUPLE' THEN s.priceStandard * 2 ELSE s.priceStandard END) DESC")
    List<Object[]> findTheaterRevenueBetween(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);
} 