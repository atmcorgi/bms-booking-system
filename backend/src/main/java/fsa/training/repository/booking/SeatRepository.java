package fsa.training.repository.booking;

import fsa.training.entity.Seat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByTheaterId(Long theaterId);
    long countByRoomId(Long roomId);
    Page<Seat> findByRoomIdOrderBySeatNumberAsc(Long roomId, Pageable pageable);
    long countByTheaterId(Long theaterId);
} 