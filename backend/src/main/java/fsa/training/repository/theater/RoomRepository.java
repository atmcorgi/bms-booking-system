package fsa.training.repository.theater;

import fsa.training.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
 
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByTheaterId(Long theaterId);

    Optional<Room> findByTheaterIdAndName(Long theaterId, String name);

    /**
     * Find rooms by multiple theater IDs (batch loading)
     */
    List<Room> findByTheaterIdIn(List<Long> theaterIds);
} 