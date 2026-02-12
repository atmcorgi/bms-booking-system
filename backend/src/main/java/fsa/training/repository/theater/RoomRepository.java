package fsa.training.repository.theater;

import fsa.training.dto.admin.RoomDetailDto;
import fsa.training.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByTheaterId(Long theaterId);
    long countByTheaterId(Long theaterId);

    @Query("SELECT new fsa.training.dto.admin.RoomDetailDto(r.id, r.name, r.supportedFormats, " +
           "(SELECT COUNT(s.id) FROM Seat s WHERE s.room.id = r.id), " +
           "(SELECT COUNT(st.id) FROM Showtime st WHERE st.room.id = r.id)) " +
           "FROM Room r " +
           "WHERE r.theater.id = :theaterId " +
           "ORDER BY r.id")
    List<RoomDetailDto> findRoomDetailsByTheaterId(@Param("theaterId") Long theaterId);

    // This method was inadvertently removed, adding it back
    java.util.Optional<Room> findByTheaterIdAndName(Long theaterId, String name);
}