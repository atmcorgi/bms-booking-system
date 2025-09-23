package fsa.training.repository.booking;

import fsa.training.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByTheaterId(Long theaterId);
    List<Seat> findByRoomId(Long roomId);
    long countByRoomId(Long roomId);
    List<Seat> findByRoomIdOrderBySeatNumberAsc(Long roomId);
} 