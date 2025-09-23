package fsa.training.factory;

import fsa.training.entity.Theater;
import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.SeatType;

/**
 * Abstract Factory để tạo nhóm Theater + Room + Seat theo brand (CGV hoặc BHD)
 */
public interface TheaterSystemFactory {
    
    Theater createTheater(String name, String address, String phone, String description);
    
    Room createRoom(String name, String supportedFormats);
    
    Seat createSeat(String seatNumber, SeatType seatType);

    default SeatType decideSeatType(int rowIndex, int colIndex, int totalRows, int seatsPerRow) {
        int vipRowStartIndex = Math.max(0, (int) Math.floor(totalRows * 0.33));
        int vipRowEndIndex = Math.min(totalRows - 1, (int) Math.ceil(totalRows * 0.66) - 1);
        int vipColStartIndex = Math.max(1, (int) Math.floor(seatsPerRow * 0.33));
        int vipColEndIndex = Math.min(seatsPerRow, (int) Math.ceil(seatsPerRow * 0.66));
        boolean isVipRow = rowIndex >= vipRowStartIndex && rowIndex <= vipRowEndIndex;
        boolean isVipCol = colIndex >= vipColStartIndex && colIndex <= vipColEndIndex;
        return (isVipRow && isVipCol) ? SeatType.VIP : SeatType.STANDARD;
    }
    
    String getBrandName();
    
    String[] getBrandFeatures();
    
    String getPricingStrategy();
}
