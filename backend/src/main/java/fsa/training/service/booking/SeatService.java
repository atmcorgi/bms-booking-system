package fsa.training.service.booking;

import fsa.training.entity.Seat;
import fsa.training.repository.booking.SeatRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SeatService {
    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    public List<Seat> findByTheaterId(Long theaterId) { return seatRepository.findByTheaterId(theaterId); }
    public List<Seat> findByRoomId(Long roomId) { return seatRepository.findByRoomId(roomId); }
    public Optional<Seat> getById(Long id) { return seatRepository.findById(id); }
} 