package fsa.training.controller.admin;

import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.repository.theater.RoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/seats")
@PreAuthorize("hasAuthority('ADMIN')")
public class SeatAdminRestController {

    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;

    public SeatAdminRestController(SeatRepository seatRepository, RoomRepository roomRepository) {
        this.seatRepository = seatRepository;
        this.roomRepository = roomRepository;
    }

    @PostMapping
    public ResponseEntity<Seat> createSeat(@RequestBody Seat payload) {
        if (payload.getRoom() == null || payload.getRoom().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Room room = roomRepository.findById(payload.getRoom().getId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        payload.setTheater(room.getTheater());
        Seat newSeat = seatRepository.save(payload);
        return ResponseEntity.ok(newSeat);
    }

    @PutMapping("/{seatId}")
    public ResponseEntity<Seat> updateSeat(@PathVariable Long seatId, @RequestBody Seat payload) {
        return seatRepository.findById(seatId)
                .map(seat -> {
                    seat.setSeatNumber(payload.getSeatNumber());
                    seat.setSeatType(payload.getSeatType());
                    Seat updatedSeat = seatRepository.save(seat);
                    return ResponseEntity.ok(updatedSeat);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{seatId}")
    public ResponseEntity<?> deleteSeat(@PathVariable Long seatId) {
        return seatRepository.findById(seatId)
                .map(seat -> {
                    seatRepository.delete(seat);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
