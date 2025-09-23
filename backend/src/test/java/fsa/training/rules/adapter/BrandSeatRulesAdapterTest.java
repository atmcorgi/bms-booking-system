package fsa.training.rules.adapter;

import fsa.training.entity.SeatType;
import fsa.training.factory.impl.BHDTheaterFactory;
import fsa.training.factory.impl.CGVTheaterFactory;
import fsa.training.factory.TheaterSystemFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BrandSeatRulesAdapterTest {

    @Test
    void cgvFactory_should_decide_vip_based_on_inlined_rules_and_front_rows_standard() {
        TheaterSystemFactory cgv = new CGVTheaterFactory();

        int totalRows = 10;
        int seatsPerRow = 10;

        // Front rows should be STANDARD (front rows constant is 2)
        assertEquals(SeatType.STANDARD, cgv.decideSeatType(0, 5, totalRows, seatsPerRow));
        assertEquals(SeatType.STANDARD, cgv.decideSeatType(1, 5, totalRows, seatsPerRow));

        // A seat within VIP area should be VIP (row ~ 50%, col ~ 50%)
        assertEquals(SeatType.VIP, cgv.decideSeatType(5, 5, totalRows, seatsPerRow));

        // A seat outside VIP area should be STANDARD
        assertEquals(SeatType.STANDARD, cgv.decideSeatType(9, 1, totalRows, seatsPerRow));
    }

    @Test
    void bhdFactory_should_mark_last_row_vip_and_apply_vip_area_rules() {
        TheaterSystemFactory bhd = new BHDTheaterFactory();

        int totalRows = 10;
        int seatsPerRow = 12;

        // Last row VIP
        assertEquals(SeatType.VIP, bhd.decideSeatType(9, 6, totalRows, seatsPerRow));

        // A mid-area VIP seat
        assertEquals(SeatType.VIP, bhd.decideSeatType(7, 6, totalRows, seatsPerRow));

        // A non-VIP seat
        assertEquals(SeatType.STANDARD, bhd.decideSeatType(2, 1, totalRows, seatsPerRow));
    }

    @Test
    void factories_should_expose_supported_formats_in_features() {
        TheaterSystemFactory cgv = new CGVTheaterFactory();
        TheaterSystemFactory bhd = new BHDTheaterFactory();

        String[] cgvFeatures = cgv.getBrandFeatures();
        String[] bhdFeatures = bhd.getBrandFeatures();

        // Basic sanity checks
        assertTrue(cgvFeatures.length > 0);
        assertTrue(bhdFeatures.length > 0);

        // Contains Supported Formats line
        assertTrue(java.util.Arrays.stream(cgvFeatures).anyMatch(s -> s.startsWith("Supported Formats:")));
        assertTrue(java.util.Arrays.stream(bhdFeatures).anyMatch(s -> s.startsWith("Supported Formats:")));
    }
}
