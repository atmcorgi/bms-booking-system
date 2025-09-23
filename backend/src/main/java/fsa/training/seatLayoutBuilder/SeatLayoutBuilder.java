package fsa.training.seatLayoutBuilder;

import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.SeatType;
import fsa.training.factory.TheaterSystemFactory;

import java.util.ArrayList;
import java.util.List;

public class SeatLayoutBuilder {

    private final TheaterSystemFactory factory;

    private int seatCount;
    private Integer explicitRows;
    private Integer explicitSeatsPerRow;

    private SeatLayoutBuilder(TheaterSystemFactory factory) {
        this.factory = factory;
    }

    public static SeatLayoutBuilder forFactory(TheaterSystemFactory factory) {
        return new SeatLayoutBuilder(factory);
    }

    public SeatLayoutBuilder withSeatCount(int seatCount) {
        this.seatCount = Math.max(0, seatCount);
        return this;
    }

    public SeatLayoutBuilder withLayout(Integer rows, Integer seatsPerRow) {
        this.explicitRows = rows;
        this.explicitSeatsPerRow = seatsPerRow;
        return this;
    }

    public List<Seat> buildFor(Room room) {
        List<Seat> seats = new ArrayList<>();
        if (room == null || seatCount <= 0) {
            return seats;
        }

        int rows = explicitRows != null && explicitRows > 0
                ? explicitRows
                : (int) Math.ceil(Math.sqrt(seatCount));
        int seatsPerRow = explicitSeatsPerRow != null && explicitSeatsPerRow > 0
                ? explicitSeatsPerRow
                : (int) Math.ceil((double) seatCount / rows);

        int generated = 0;
        for (int rowIndex = 0; rowIndex < rows && generated < seatCount; rowIndex++) {
            char rowChar = (char) ('A' + rowIndex);
            for (int col = 1; col <= seatsPerRow && generated < seatCount; col++) {
                String seatNumberStr = rowChar + String.valueOf(col);
                SeatType seatType = factory.decideSeatType(rowIndex, col, rows, seatsPerRow);
                Seat seat = factory.createSeat(seatNumberStr, seatType);
                seat.setTheater(room.getTheater());
                seat.setRoom(room);
                seats.add(seat);
                generated++;
            }
        }
        return seats;
    }
}
