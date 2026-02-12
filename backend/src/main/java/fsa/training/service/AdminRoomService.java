package fsa.training.service;

import fsa.training.dto.admin.RoomDetailDto;
import fsa.training.repository.theater.RoomRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminRoomService {

    private final RoomRepository roomRepository;

    public AdminRoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomDetailDto> getRoomsForTheater(Long theaterId) {
        return roomRepository.findRoomDetailsByTheaterId(theaterId);
    }
}
