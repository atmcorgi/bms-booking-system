package fsa.training.service.theater;

import fsa.training.entity.District;
import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.Theater;
import fsa.training.entity.Province;
import fsa.training.factory.TheaterSystemFactory;
import fsa.training.factory.TheaterFactoryCreator;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.seatLayoutBuilder.SeatLayoutBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
public class TheaterCreationService {

    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final TheaterFactoryCreator factoryCreator;

    public TheaterCreationService(TheaterRepository theaterRepository,
                                  RoomRepository roomRepository,
                                  SeatRepository seatRepository) {
        this.theaterRepository = theaterRepository;
        this.roomRepository = roomRepository;
        this.seatRepository = seatRepository;
        this.factoryCreator = new TheaterFactoryCreator();
    }

    public Theater create(String brand,
                          String theaterName,
                          String theaterCode,
                          String address,
                          String phone,
                          String description,
                          Province province,
                          District district,
                          List<String> roomNames,
                          int seatsPerRoom) {
        TheaterSystemFactory factory = factoryCreator.getFactory(brand);

        // Tự động tạo theaterCode nếu không được cung cấp
        if (theaterCode == null || theaterCode.trim().isEmpty()) {
            theaterCode = slugify(theaterName);
        }

        Theater theater = factory.createTheater(theaterName, address, phone, description);
        theater.setCode(theaterCode);
        theater.setProvince(province);
        theater.setDistrict(district);
        Theater savedTheater = theaterRepository.save(theater);

        if (roomNames != null && !roomNames.isEmpty()) {
            for (String roomName : roomNames) {
                Room room = factory.createRoom(roomName, "2D|3D");
                room.setTheater(savedTheater);
                Room savedRoom = roomRepository.save(room);
                createSeatsForRoom(factory, savedRoom, seatsPerRoom);
            }
        }
        return savedTheater;
    }

    private String slugify(String name) {
        if (name == null) return "";
        String n = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        n = n.toUpperCase(java.util.Locale.ROOT).replaceAll("[^A-Z0-9]+", "").trim();
        if (n.isEmpty()) n = "THEATER";
        return n.length() > 50 ? n.substring(0, 50) : n;
    }

    private void createSeatsForRoom(TheaterSystemFactory factory, Room room, int seatCount) {
        if (seatCount <= 0) {
            return;
        }
        List<Seat> seats = SeatLayoutBuilder
                .forFactory(factory)
                .withSeatCount(seatCount)
                .buildFor(room);
        if (!seats.isEmpty()) {
            seatRepository.saveAll(seats);
            seatRepository.flush();
        }
    }
}
