package fsa.training.service.theater;

import fsa.training.entity.District;
import fsa.training.entity.Province;
import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.Theater;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TheaterCreationServiceTest {

    private TheaterRepository theaterRepository;
    private RoomRepository roomRepository;
    private SeatRepository seatRepository;

    private TheaterCreationService creationService;

    @BeforeEach
    void setUp() {
        theaterRepository = Mockito.mock(TheaterRepository.class);
        roomRepository = Mockito.mock(RoomRepository.class);
        seatRepository = Mockito.mock(SeatRepository.class);
        creationService = new TheaterCreationService(theaterRepository, roomRepository, seatRepository);
    }

    // ==========================================
    // Group 1: Happy paths by brand (formatting)
    // - Đảm bảo Factory gắn hậu tố brand vào name/description
    // - Có tạo room/seat khi dữ liệu hợp lệ
    // ==========================================
    @Test
    @DisplayName("create - BHD happy path: formats name/description per BHD")
    void create_BHD_HappyPath_FormatsBrand() {
        String brand = "BHD";
        String name = "BHD Star";
        String address = "1 Street";
        String phone = "0999";
        String description = "D";

        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(10L);
            return t;
        });
        when(roomRepository.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(10L);
            return r;
        });
        when(seatRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        Theater result = creationService.create(brand, name, "TEST001", address, phone, description,
                null, null, List.of("R1"), 2);

        assertNotNull(result);
        assertEquals("BHD Star - BHD", result.getName());
        assertEquals("D | BHD - Quality Entertainment", result.getDescription());
        verify(roomRepository, times(1)).save(any(Room.class));
        verify(seatRepository, atLeastOnce()).saveAll(any());
    }

    // ==========================================
    // Group 2: Room/Seat variations
    // - roomNames null/rỗng → chỉ tạo theater, không tạo room/seat
    // - seatsPerRoom = 1 → chắc chắn có seat
    // - nhiều phòng → verify gọi save room đúng số lần
    // ==========================================
    @Test
    @DisplayName("create - null roomNames: creates theater only")
    void create_NullRooms_CreatesTheaterOnly() {
        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(11L);
            return t;
        });

        Theater result = creationService.create("CGV", "T", "TEST001", "A", "P", "D",
                new Province(), new District(), null, 10);

        assertNotNull(result);
        verify(theaterRepository, times(1)).save(any(Theater.class));
        verify(roomRepository, never()).save(any());
        verify(seatRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("create - seatsPerRoom = 1: ensures at least one seat saved")
    void create_MinSeat_SavesSeats() {
        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(12L);
            return t;
        });
        when(roomRepository.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(12L);
            return r;
        });

        creationService.create("CGV", "T", "TEST001", "A", "P", "D",
                new Province(), new District(), List.of("R1"), 1);

        verify(roomRepository, times(1)).save(any(Room.class));
        verify(seatRepository, atLeastOnce()).saveAll(any());
    }

    @Test
    @DisplayName("create - many rooms (light): verifies room saves scale")
    void create_ManyRooms_VerifyRoomSaves() {
        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(13L);
            return t;
        });
        when(roomRepository.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(13L);
            return r;
        });
        when(seatRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        List<String> roomNames = java.util.stream.IntStream.rangeClosed(1, 20)
                .mapToObj(i -> "R" + i).toList();

        creationService.create("CGV", "T", "TEST001", "A", "P", "D",
                new Province(), new District(), roomNames, 2);

        verify(roomRepository, times(roomNames.size())).save(any(Room.class));
        verify(seatRepository, atLeastOnce()).saveAll(any());
    }

    // ==========================================
    // Group 3: Input edge-cases
    // - brand hợp lệ nhưng geo null → vẫn lưu theater, quan hệ null
    // - seatsPerRoom âm → tạo room nhưng không tạo seat
    // ==========================================

    @Test
    @DisplayName("create - null province/district: saved with null geo")
    void create_NullGeo_SavedWithNulls() {
        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(14L);
            return t;
        });

        Theater result = creationService.create("CGV", "T", "TEST001", "A", "P", "D",
                null, null, List.of(), 10);

        assertNotNull(result);
        assertNull(result.getProvince());
        assertNull(result.getDistrict());
        verify(roomRepository, never()).save(any());
        verify(seatRepository, never()).saveAll(any());
    }
    // (Group 1 tiếp) Happy path cho CGV
    @Test
    @DisplayName("create - CGV happy path: creates theater, rooms, seats")
    void create_CGV_HappyPath_CreatesAll() {
        String brand = "CGV";
        String name = "CGV Vincom";
        String address = "123 Test";
        String phone = "0901";
        String description = "Desc";
        Province province = new Province();
        province.setId(1L);
        District district = new District();
        district.setId(1L);
        district.setProvince(province);
        List<String> roomNames = List.of("R1", "R2");

        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });
        when(roomRepository.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(seatRepository.saveAll(any())).thenAnswer(inv -> {
            List<Seat> seats = inv.getArgument(0);
            for (int i = 0; i < seats.size(); i++) {
                seats.get(i).setId((long) (i + 1));
            }
            return seats;
        });

        Theater result = creationService.create(brand, name, "TEST001", address, phone, description,
                province, district, roomNames, 4);

        assertNotNull(result);
        assertEquals("CGV Vincom - CGV", result.getName());
        assertEquals(province, result.getProvince());
        assertEquals(district, result.getDistrict());

        verify(theaterRepository, times(1)).save(any(Theater.class));
        verify(roomRepository, times(roomNames.size())).save(any(Room.class));
        verify(seatRepository, atLeastOnce()).saveAll(any());
    }

    @Test
    @DisplayName("create - empty roomNames: creates theater only")
    void create_EmptyRooms_CreatesTheaterOnly() {
        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(2L);
            return t;
        });

        Theater result = creationService.create("CGV", "T", "TEST001", "A", "P", "D",
                new Province(), new District(), List.of(), 10);

        assertNotNull(result);
        verify(theaterRepository, times(1)).save(any(Theater.class));
        verify(roomRepository, never()).save(any());
        verify(seatRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("create - negative seats: rooms created, no seats")
    void create_NegativeSeats_NoSeats() {
        when(theaterRepository.save(any(Theater.class))).thenAnswer(inv -> {
            Theater t = inv.getArgument(0);
            t.setId(3L);
            return t;
        });
        when(roomRepository.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(3L);
            return r;
        });

        Theater result = creationService.create("BHD", "BHD Star", "TEST001", "A", "P", "D",
                new Province(), new District(), List.of("R1"), -1);

        assertNotNull(result);
        verify(roomRepository, times(1)).save(any(Room.class));
        verify(seatRepository, never()).saveAll(any());
    }

    // ==========================================
    // Group 4: Error/Unsupported paths
    // - unsupported brand → throws
    // - repository throws → propagate
    // ==========================================
    @Test
    @DisplayName("create - unsupported brand: throws IllegalArgumentException")
    void create_UnsupportedBrand_Throws() {
        assertThrows(IllegalArgumentException.class, () ->
                creationService.create("UNKNOWN", "T", "TEST001", "A", "P", "D",
                        new Province(), new District(), List.of("R1"), 5)
        );
    }
    @Test
    @DisplayName("create - repository throws: propagates error")
    void create_RepoThrows_Propagates() {
        when(theaterRepository.save(any(Theater.class))).thenThrow(new RuntimeException("db"));

        assertThrows(RuntimeException.class, () ->
creationService.create("CGV", "T", "TEST001", "A", "P", "D",
                new Province(), new District(), List.of("R1"), 10)
        );
        verify(roomRepository, never()).save(any());
        verify(seatRepository, never()).saveAll(any());
    }
}


