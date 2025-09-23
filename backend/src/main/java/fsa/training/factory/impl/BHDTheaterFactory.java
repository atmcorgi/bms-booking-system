package fsa.training.factory.impl;

import fsa.training.entity.Theater;
import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.SeatType;
import fsa.training.factory.TheaterSystemFactory;

public class BHDTheaterFactory implements TheaterSystemFactory {

    // Inlined BHD-specific rule constants (remove adapter/proxy)
    private static final double VIP_ROW_START = 0.5; // 50% from front
    private static final double VIP_ROW_END = 0.9;   // 90% from front
    private static final double VIP_COL_START = 0.3; // 30% from left
    private static final double VIP_COL_END = 0.7;   // 70% from left
    private static final boolean LAST_ROW_VIP = true;
    private static final String[] SUPPORTED_FORMATS = new String[]{"2D", "3D", "Dolby Digital"};
    
    @Override
    public Theater createTheater(String name, String address, String phone, String description) {
        return Theater.builder()
            .name(name + " - BHD")
            .address(address)
            .phone(phone)
            .description(description + " | BHD - Quality Entertainment")
            .openTime(java.time.LocalTime.of(9, 0))
            .closeTime(java.time.LocalTime.of(23, 0))
            .build();
    }
    
    @Override
    public Room createRoom(String name, String supportedFormats) {
        return Room.builder()
            .name(name + " (BHD Standard)")
            .supportedFormats(supportedFormats + "|Dolby Digital")
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
        // BHD logic: Last row is VIP if configured
        if (LAST_ROW_VIP && rowIndex == totalRows - 1) {
            return SeatType.VIP;
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
        return "BHD";
    }
    
    @Override
    public String[] getBrandFeatures() {
        String[] formats = SUPPORTED_FORMATS;
        return new String[]{
            "Dolby Digital Sound",
            "Comfortable Seating",
            "Snack Bar Service",
            "Family Friendly",
            "Affordable Pricing",
            "Easy Parking",
            "Supported Formats: " + String.join(", ", formats)
        };
    }
    
    @Override
    public String getPricingStrategy() {
        return "Affordable pricing with family discounts";
    }
}
