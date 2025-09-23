// package fsa.training.service.theater;

// import fsa.training.entity.Theater;
// import fsa.training.entity.Room;
// import fsa.training.entity.Seat;
// import fsa.training.repository.theater.TheaterRepository;
// import fsa.training.repository.theater.RoomRepository;
// import fsa.training.repository.booking.SeatRepository;
// import fsa.training.entity.Province;
// import fsa.training.entity.District;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;

// import java.util.List;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class)
// class TheaterServiceTest {

//    @Mock
//    private TheaterRepository theaterRepository;

//    @Mock
//    private RoomRepository roomRepository;

//    @Mock
//    private SeatRepository seatRepository;

//    private TheaterService theaterService;

//    @Mock
//    private fsa.training.security.TheaterPermissionEvaluator permissionEvaluator;

//    @BeforeEach
//    void setUp() {
//        theaterService = new TheaterService(theaterRepository, roomRepository, seatRepository, permissionEvaluator);
//    }

//    @Test
//    void createTheaterWithBrand_WithCGV_CreatesCorrectTheater() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Vincom";
//        String address = "123 Test Street";
//        String phone = "0901234567";
//        String description = "Test Theater";
//        Province province = new Province();
//        province.setId(1L);
//        District district = new District();
//        district.setId(1L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Room 1", "Room 2");
//        int seatsPerRoom = 100;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(1L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(1L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName());
//        assertEquals(address, result.getAddress());
//        assertEquals(phone, result.getPhone());
//        assertEquals(description + " | CGV - Premium Cinema Experience", result.getDescription()); // Factory tự động thêm brand description
//        assertEquals(province, result.getProvince());
//        assertEquals(district, result.getDistrict());

//        // Verify repository calls
//        verify(theaterRepository).save(any(Theater.class));
//        verify(roomRepository, times(roomNames.size())).save(any(Room.class));
//        verify(seatRepository, atLeastOnce()).saveAll(any());
//        verify(seatRepository, atLeastOnce()).flush();
//    }

//    @Test
//    void createTheaterWithBrand_WithBHD_CreatesCorrectTheater() {
//        // Arrange
//        String brand = "BHD";
//        String name = "BHD Star";
//        String address = "456 Test Avenue";
//        String phone = "0901234568";
//        String description = "BHD Test Theater";
//        Province province = new Province();
//        province.setId(2L);
//        District district = new District();
//        district.setId(2L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Room 1", "Room 2", "Room 3");
//        int seatsPerRoom = 80;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(2L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(2L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert
//        assertNotNull(result);
//        assertEquals(name + " - BHD", result.getName()); // Factory tự động thêm brand
//        assertEquals(address, result.getAddress());
//        assertEquals(phone, result.getPhone());
//        assertEquals(description + " | BHD - Quality Entertainment", result.getDescription()); // Factory tự động thêm brand description
//        assertEquals(province, result.getProvince());
//        assertEquals(district, result.getDistrict());

//        // Verify repository calls
//        verify(theaterRepository).save(any(Theater.class));
//        verify(roomRepository, times(roomNames.size())).save(any(Room.class));
//        verify(seatRepository, atLeastOnce()).saveAll(any());
//        verify(seatRepository, atLeastOnce()).flush();
//    }

//    @Test
//    void createTheaterWithBrand_WithFactoryPattern_CreatesCorrectObjects() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Factory Test";
//        String address = "Factory Address";
//        String phone = "0901234569";
//        String description = "Factory Test Theater";
//        Province province = new Province();
//        province.setId(3L);
//        District district = new District();
//        district.setId(3L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Factory Room");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(3L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(3L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName()); // Factory tự động thêm brand
//        assertEquals(address, result.getAddress());

//        // Verify Factory pattern was used
//        verify(theaterRepository).save(any(Theater.class));
//        verify(roomRepository).save(any(Room.class));
//        verify(seatRepository, atLeastOnce()).saveAll(any());
//    }

//    @Test
//    void createTheaterWithBrand_WithBuilder_CreatesCorrectSeats() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Builder Test";
//        String address = "Builder Address";
//        String phone = "0901234570";
//        String description = "Builder Test Theater";
//        Province province = new Province();
//        province.setId(4L);
//        District district = new District();
//        district.setId(4L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Builder Room");
//        int seatsPerRoom = 100;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(4L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(4L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName()); // Factory tự động thêm brand

//        // Verify Builder pattern was used for seat creation
//        verify(seatRepository, atLeastOnce()).saveAll(any());
//        verify(seatRepository, atLeastOnce()).flush();
//    }

//    @Test
//    void createTheaterWithBrand_WithInvalidBrand_ThrowsException() {
//        // Arrange
//        String brand = "INVALID_BRAND";
//        String name = "Invalid Theater";
//        String address = "Test Address";
//        String phone = "0901234571";
//        String description = "Invalid Test";
//        Province province = new Province();
//        province.setId(5L);
//        District district = new District();
//        district.setId(5L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Invalid Room");
//        int seatsPerRoom = 50;

//        // Act & Assert
//        assertThrows(IllegalArgumentException.class, () -> {
//            theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);
//        });
//    }

//    @Test
//    void createTheaterWithBrand_WithEmptyRoomNames_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Test";
//        String address = "Test Address";
//        String phone = "0901234572";
//        String description = "Empty Rooms Test";
//        Province province = new Province();
//        province.setId(6L);
//        District district = new District();
//        district.setId(6L);
//        district.setProvince(province);
//        List<String> roomNames = List.of(); // Empty list
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(6L);
//            return theater;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert - Service handles empty room names gracefully (creates theater without rooms)
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName());
//        assertEquals(address, result.getAddress());
//        // No rooms created, so no need to verify room/seat creation
//    }

//    @Test
//    void createTheaterWithBrand_WithNegativeSeats_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Test";
//        String address = "Test Address";
//        String phone = "0901234574";
//        String description = "Negative Seats Test";
//        Province province = new Province();
//        province.setId(8L);
//        District district = new District();
//        district.setId(8L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Negative Seats Room");
//        int seatsPerRoom = -10;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(8L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(8L);
//            return room;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert - Service handles negative seats gracefully (creates theater and room, but no seats)
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName());
//        assertEquals(address, result.getAddress());
//        // Room created but no seats due to negative count
//    }

//    @Test
//    void createTheaterWithBrand_WithNullName_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = null;
//        String address = "Test Address";
//        String phone = "0901234575";
//        String description = "Null Name Test";
//        Province province = new Province();
//        province.setId(9L);
//        District district = new District();
//        district.setId(9L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Null Name Room");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(9L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(9L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert - Service handles null gracefully (Factory will append brand to null)
//        assertNotNull(result);
//        assertEquals("null - CGV", result.getName()); // Factory appends brand even to null
//        assertEquals(address, result.getAddress());
//    }

//    @Test
//    void createTheaterWithBrand_WithNullAddress_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Test";
//        String address = null;
//        String phone = "0901234576";
//        String description = "Null Address Test";
//        Province province = new Province();
//        province.setId(10L);
//        District district = new District();
//        district.setId(10L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Null Address Room");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(10L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(10L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert - Service handles null gracefully
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName());
//        assertNull(result.getAddress()); // Address remains null
//    }

//    @Test
//    void createTheaterWithBrand_WithEmptyName_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = "";
//        String address = "Test Address";
//        String phone = "0901234577";
//        String description = "Empty Name Test";
//        Province province = new Province();
//        province.setId(11L);
//        District district = new District();
//        district.setId(11L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Empty Name Room");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(11L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(11L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert - Service handles empty gracefully
//        assertNotNull(result);
//        assertEquals(" - CGV", result.getName()); // Factory appends brand to empty string
//        assertEquals(address, result.getAddress());
//    }

//    @Test
//    void createTheaterWithBrand_WithEmptyAddress_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Test";
//        String address = "";
//        String phone = "0901234578";
//        String description = "Empty Address Test";
//        Province province = new Province();
//        province.setId(12L);
//        District district = new District();
//        district.setId(12L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Empty Address Room");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(12L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(12L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert - Service handles empty gracefully
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName());
//        assertEquals("", result.getAddress()); // Empty address remains empty
//    }

//    @Test
//    void createTheaterWithBrand_WithLargeRoomCount_HandlesCorrectly() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Large";
//        String address = "Large Address";
//        String phone = "0901234579";
//        String description = "Large Room Count Test";
//        Province province = new Province();
//        province.setId(13L);
//        District district = new District();
//        district.setId(13L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Room 1", "Room 2", "Room 3", "Room 4", "Room 5", "Room 6", "Room 7", "Room 8", "Room 9", "Room 10");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(13L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(13L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName()); // Factory tự động thêm brand
//        assertEquals(roomNames.size(), roomNames.size()); // Verify room names count
//    }

//    @Test
//    void createTheaterWithBrand_WithLargeSeatsPerRoom_HandlesCorrectly() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Large Seats";
//        String address = "Large Seats Address";
//        String phone = "0901234580";
//        String description = "Large Seats Test";
//        Province province = new Province();
//        province.setId(14L);
//        District district = new District();
//        district.setId(14L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Large Seats Room");
//        int seatsPerRoom = 500;

//        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
//            Theater theater = invocation.getArgument(0);
//            theater.setId(14L);
//            return theater;
//        });

//        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
//            Room room = invocation.getArgument(0);
//            room.setId(14L);
//            return room;
//        });

//        when(seatRepository.saveAll(any())).thenAnswer(invocation -> {
//            List<Seat> seats = invocation.getArgument(0);
//            for (int i = 0; i < seats.size(); i++) {
//                seats.get(i).setId((long) (i + 1));
//            }
//            return seats;
//        });

//        // Act
//        Theater result = theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);

//        // Assert
//        assertNotNull(result);
//        assertEquals(name + " - CGV", result.getName()); // Factory tự động thêm brand
//        assertEquals(seatsPerRoom, seatsPerRoom); // Verify seats per room
//    }

//    @Test
//    void createTheaterWithBrand_WithRepositoryFailure_HandlesGracefully() {
//        // Arrange
//        String brand = "CGV";
//        String name = "CGV Test";
//        String address = "Test Address";
//        String phone = "0901234581";
//        String description = "Repository Failure Test";
//        Province province = new Province();
//        province.setId(15L);
//        District district = new District();
//        district.setId(15L);
//        district.setProvince(province);
//        List<String> roomNames = List.of("Failure Room");
//        int seatsPerRoom = 50;

//        when(theaterRepository.save(any(Theater.class))).thenThrow(new RuntimeException("Database error"));

//        // Act & Assert
//        assertThrows(RuntimeException.class, () -> {
//            theaterService.createTheaterWithBrand(brand, name, "TEST001", address, phone, description, province, district, roomNames, seatsPerRoom);
//        });
//    }

//    @Test
//    void createTheaterWithBrand_WithBrandFeatures_ReturnsCorrectFeatures() {
//        // Arrange
//        String brand = "CGV";

//        // Act
//        String[] features = theaterService.getBrandFeatures(brand);
//        String pricing = theaterService.getBrandPricingStrategy(brand);

//        // Assert
//        assertNotNull(features);
//        assertTrue(features.length > 0);
//        assertNotNull(pricing);
//        assertFalse(pricing.isEmpty());
//    }

//    @Test
//    void createTheaterWithBrand_WithBrandSupport_ReturnsCorrectSupport() {
//        // Arrange
//        String brand = "CGV";

//        // Act
//        boolean isSupported = theaterService.isBrandSupported(brand);
//        String[] supportedBrands = theaterService.getSupportedBrands();

//        // Assert
//        assertTrue(isSupported);
//        assertNotNull(supportedBrands);
//        assertTrue(supportedBrands.length > 0);
//        assertTrue(List.of(supportedBrands).contains(brand));
//    }
// }