package fsa.training.repository.booking;

import fsa.training.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByShowtimeId(Long showtimeId);

    @Query("select distinct b from Booking b " +
           "join fetch b.showtime s " +
           "left join fetch s.room r " +
           "left join fetch s.theater t " +
           "join fetch b.seat seat " +
           "where b.id in :ids")
    List<Booking> getByIds(@Param("ids") List<Long> ids);
} 