package fsa.training.controller.admin;

import fsa.training.entity.Room;
import fsa.training.entity.Theater;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminRoomApiController {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping("/theaters/{theaterId}/rooms")
    public List<Map<String, Object>> listRooms(@PathVariable Long theaterId) {
        return roomRepository.findByTheaterId(theaterId).stream().map(this::toRoom).collect(Collectors.toList());
    }

    @PostMapping("/theaters/{theaterId}/rooms")
    public ResponseEntity<?> createRoom(@PathVariable Long theaterId, @RequestBody Map<String, Object> body) {
        Theater theater = theaterRepository.findById(theaterId).orElseThrow(() -> new IllegalArgumentException("Theater not found"));
        Room room = new Room();
        room.setName(String.valueOf(body.get("name")));
        room.setTheater(theater);
        Room saved = roomRepository.save(room);
        return ResponseEntity.created(URI.create("/api/admin/rooms/" + saved.getId())).body(toRoom(saved));
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable Long roomId) {
        return roomRepository.findById(roomId)
                .<ResponseEntity<?>>map(r -> ResponseEntity.ok(toRoom(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<?> updateRoom(@PathVariable Long roomId, @RequestBody Map<String, Object> body) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
        room.setName(String.valueOf(body.get("name")));
        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(toRoom(saved));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long roomId) {
        roomRepository.deleteById(roomId);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toRoom(Room r) {
        return Map.of(
                "id", r.getId(),
                "name", r.getName(),
                "theaterId", r.getTheater() != null ? r.getTheater().getId() : null,
                "supportedFormats", r.getSupportedFormats() != null ? r.getSupportedFormats() : ""
        );
    }
}


