package fsa.training.controller.admin;

import fsa.training.entity.Room;
import fsa.training.entity.Theater;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.entity.Seat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rooms/v2")
@PreAuthorize("hasAuthority('ADMIN')")
public class RoomAdminRestController {

    private final RoomRepository roomRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository seatRepository;

    public RoomAdminRestController(RoomRepository roomRepository, TheaterRepository theaterRepository, SeatRepository seatRepository) {
        this.roomRepository = roomRepository;
        this.theaterRepository = theaterRepository;
        this.seatRepository = seatRepository;
    }

    // Note: GET endpoints for rooms already exist in AdminRoomApiController. Avoid duplicating mappings here.

    @PostMapping
    public ResponseEntity<Room> create(@RequestParam Long theaterId, @RequestBody Room payload) {
        Theater theater = theaterRepository.findById(theaterId).orElse(null);
        if (theater == null) return ResponseEntity.notFound().build();
        Room room = new Room();
        room.setName(payload.getName());
        room.setSupportedFormats(payload.getSupportedFormats());
        room.setTheater(theater);
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<Room> update(@PathVariable Long roomId, @RequestBody Room payload) {
        return roomRepository.findById(roomId)
                .map(r -> {
                    r.setName(payload.getName());
                    r.setSupportedFormats(payload.getSupportedFormats());
                    return ResponseEntity.ok(roomRepository.save(r));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> delete(@PathVariable Long roomId) {
        return roomRepository.findById(roomId)
                .map(r -> {
                    roomRepository.deleteById(roomId);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{roomId}/seats")
    public ResponseEntity<List<Seat>> listSeatsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(seatRepository.findByRoomIdOrderBySeatNumberAsc(roomId));
    }
    
}


