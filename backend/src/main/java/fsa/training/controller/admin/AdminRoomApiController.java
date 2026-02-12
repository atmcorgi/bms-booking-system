package fsa.training.controller.admin;

import fsa.training.dto.admin.RoomDetailDto;
import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.Theater;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.service.AdminRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminRoomApiController {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private AdminRoomService adminRoomService;

    @GetMapping("/theaters/{theaterId}/rooms")
    public List<RoomDetailDto> listRooms(@PathVariable Long theaterId) {
        return adminRoomService.getRoomsForTheater(theaterId);
    }

    @PostMapping("/theaters/{theaterId}/rooms")
    public ResponseEntity<?> createRoom(@PathVariable Long theaterId, @RequestBody Map<String, Object> body) {
        Theater theater = theaterRepository.findById(theaterId).orElseThrow(() -> new IllegalArgumentException("Theater not found"));
        Room room = new Room();
        room.setName(String.valueOf(body.get("name")));
        room.setTheater(theater);
        room.setSupportedFormats(String.valueOf(body.get("supportedFormats")));
        Room saved = roomRepository.save(room);
        return ResponseEntity.created(URI.create("/api/admin/rooms/" + saved.getId())).body(saved);
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable Long roomId) {
        return roomRepository.findById(roomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<?> updateRoom(@PathVariable Long roomId, @RequestBody Map<String, Object> body) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
        room.setName(String.valueOf(body.get("name")));
        room.setSupportedFormats(String.valueOf(body.get("supportedFormats")));
        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long roomId) {
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found"));
            
            // Check if room has any showtimes
            if (room.getShowtimes() != null && !room.getShowtimes().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Không thể xóa phòng có suất chiếu. Vui lòng xóa các suất chiếu trước."));
            }
            
            roomRepository.delete(room);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Lỗi khi xóa phòng: " + e.getMessage()));
        }
    }

    @GetMapping("/rooms/{roomId}/seats")
    public ResponseEntity<Page<Seat>> getRoomSeats(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Seat> seats = seatRepository.findByRoomIdOrderBySeatNumberAsc(roomId, pageable);
        return ResponseEntity.ok(seats);
    }
}


