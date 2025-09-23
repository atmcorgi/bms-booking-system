package fsa.training.factory.decorator;

import fsa.training.entity.Room;
import fsa.training.entity.Seat;
import fsa.training.entity.SeatType;
import fsa.training.entity.Theater;
import fsa.training.factory.TheaterSystemFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Decorator để log thời gian thực thi các phương thức của TheaterSystemFactory.
 */
public class FactoryLoggingDecorator implements TheaterSystemFactory {

    private static final Logger logger = LoggerFactory.getLogger(FactoryLoggingDecorator.class);
    
    private final TheaterSystemFactory delegate;

    public FactoryLoggingDecorator(TheaterSystemFactory delegate) {
        this.delegate = delegate;
    }

    @Override
    public Theater createTheater(String name, String address, String phone, String description) {
        long t0 = System.nanoTime();
        Theater t = delegate.createTheater(name, address, phone, description);
        long dur = System.nanoTime() - t0;
        logger.debug("[Factory-Log] createTheater({}) took {}ns", delegate.getBrandName(), dur);
        return t;
    }

    @Override
    public Room createRoom(String name, String supportedFormats) {
        long t0 = System.nanoTime();
        Room r = delegate.createRoom(name, supportedFormats);
        long dur = System.nanoTime() - t0;
        logger.debug("[Factory-Log] createRoom({}) took {}ns", delegate.getBrandName(), dur);
        return r;
    }

    @Override
    public Seat createSeat(String seatNumber, SeatType seatType) {
        long t0 = System.nanoTime();
        Seat s = delegate.createSeat(seatNumber, seatType);
        long dur = System.nanoTime() - t0;
        logger.debug("[Factory-Log] createSeat({}) took {}ns", seatType, dur);
        return s;
    }

    @Override
    public SeatType decideSeatType(int rowIndex, int colIndex, int totalRows, int seatsPerRow) {
        long t0 = System.nanoTime();
        SeatType type = delegate.decideSeatType(rowIndex, colIndex, totalRows, seatsPerRow);
        long dur = System.nanoTime() - t0;
        if ((rowIndex == 0 && colIndex == 1) || (rowIndex == totalRows - 1 && colIndex == seatsPerRow)) {
            logger.debug("[Factory-Log] decideSeatType sample took {}ns → {}", dur, type);
        }
        return type;
    }

    @Override
    public String getBrandName() {
        return delegate.getBrandName();
    }

    @Override
    public String[] getBrandFeatures() {
        return delegate.getBrandFeatures();
    }

    @Override
    public String getPricingStrategy() {
        return delegate.getPricingStrategy();
    }
}


