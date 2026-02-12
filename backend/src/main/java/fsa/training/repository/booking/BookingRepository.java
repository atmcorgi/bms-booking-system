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
    @Query("select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.movie m " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.account.id = :accountId " +
           "order by b.bookingTime desc")
    org.springframework.data.domain.Page<Booking> findByAccountIdWithDetails(@Param("accountId") Long accountId, org.springframework.data.domain.Pageable pageable);

    @Query("select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.movie m " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.account.id = :accountId and b.status = :status " +
           "order by b.bookingTime desc")
    org.springframework.data.domain.Page<Booking> findByAccountIdAndStatusWithDetails(@Param("accountId") Long accountId, @Param("status") String status, org.springframework.data.domain.Pageable pageable);
} 