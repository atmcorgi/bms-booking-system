package fsa.training.factory.impl;

import fsa.training.entity.Theater;
import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.SeatType;
import fsa.training.factory.TheaterSystemFactory;

public class CGVTheaterFactory implements TheaterSystemFactory {

    // Inlined CGV-specific rule constants (remove adapter/proxy)
    private static final double VIP_ROW_START = 0.3; // 30% from front
    private static final double VIP_ROW_END = 0.7;   // 70% from front
    private static final double VIP_COL_START = 0.2; // 20% from left
    private static final double VIP_COL_END = 0.8;   // 80% from left
    private static final int FRONT_STANDARD_ROWS = 2;
    private static final String[] SUPPORTED_FORMATS = new String[]{"2D", "3D", "IMAX", "4DX", "Dolby Atmos"};
    
    @Override
    public Theater createTheater(String name, String address, String phone, String description) {
        return Theater.builder()
            .name(name + " - CGV")
            .address(address)
            .phone(phone)
            .description(description + " | CGV - Premium Cinema Experience")
            .openTime(java.time.LocalTime.of(8, 0))
            .closeTime(java.time.LocalTime.of(23, 30))
            .build();
    }
    
    @Override
    public Room createRoom(String name, String supportedFormats) {
        return Room.builder()
            .name(name + " (CGV Premium)")
            .supportedFormats(supportedFormats + "|IMAX|4DX|Dolby Atmos")
            .build();
    }
    
    @Override
    public Seat createSeat(String seatNumber, SeatType seatType) {
        Seat seat = new Seat();
        seat.setSeatNumber(seatNumber);
        seat.setSeatType(seatType);
        return seat;
    }

    @Override
    public SeatType decideSeatType(int rowIndex, int colIndex, int totalRows, int seatsPerRow) {
        // CGV logic: Front rows are always STANDARD
        if (rowIndex <= FRONT_STANDARD_ROWS - 1) {
            return SeatType.STANDARD;
        }
        
        // Calculate VIP area
        int vipRowStartIndex = (int) Math.floor(totalRows * VIP_ROW_START);
        int vipRowEndIndex = (int) Math.ceil(totalRows * VIP_ROW_END) - 1;
        int vipColStartIndex = Math.max(1, (int) Math.floor(seatsPerRow * VIP_COL_START));
        int vipColEndIndex = Math.min(seatsPerRow, (int) Math.ceil(seatsPerRow * VIP_COL_END));
        
        boolean isVipRow = rowIndex >= vipRowStartIndex && rowIndex <= vipRowEndIndex;
        boolean isVipCol = colIndex >= vipColStartIndex && colIndex <= vipColEndIndex;
        
        return (isVipRow && isVipCol) ? SeatType.VIP : SeatType.STANDARD;
    }
    
    @Override
    public String getBrandName() {
        return "CGV";
    }
    
    @Override
    public String[] getBrandFeatures() {
        String[] formats = SUPPORTED_FORMATS;
        return new String[]{
            "IMAX Technology",
            "4DX Experience", 
            "Dolby Atmos Sound",
            "Premium Food Service",
            "Luxury Seating",
            "Online Booking",
            "Supported Formats: " + String.join(", ", formats)
        };
    }
    
    @Override
    public String getPricingStrategy() {
        return "Premium pricing with IMAX/4DX surcharge";
    }
}
