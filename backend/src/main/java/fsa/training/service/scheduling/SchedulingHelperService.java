package fsa.training.service.scheduling;

import fsa.training.dto.booking.SchedulingUploadDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class SchedulingHelperService {

    /**
     * Create pagination for scheduling slots
     */
    public Page<SchedulingUploadDto> createPagination(List<SchedulingUploadDto> slots, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), slots.size());
        return new PageImpl<>(slots.subList(start, end), pageable, slots.size());
    }

    /**
     * Get week presets for UI
     */
    public WeekPresets getWeekPresets() {
        LocalDate today = LocalDate.now();
        // Tuần này: hôm nay -> Chủ nhật tuần này
        int dow = today.getDayOfWeek().getValue(); // Mon=1..Sun=7
        LocalDate thisWeekStart = today;
        LocalDate thisWeekEnd = today.plusDays(7 - dow); // đến CN

        // Tuần sau: Thứ Hai tuần sau -> Chủ nhật tuần sau
        int daysToNextMonday = (8 - dow) % 7; // 0 nếu hôm nay là CN -> +1 sẽ về Mon
        if (daysToNextMonday == 0) {
            daysToNextMonday = 1; // từ CN thì next Monday là ngày mai
        }
        LocalDate nextWeekStart = today.plusDays(daysToNextMonday);
        // đảm bảo là Monday
        nextWeekStart = nextWeekStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDate nextWeekEnd = nextWeekStart.plusDays(6);
        
        return new WeekPresets(thisWeekStart, thisWeekEnd, nextWeekStart, nextWeekEnd);
    }

    /**
     * Validate scheduling dates
     */
    public boolean validateDates(String startDate, String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            return !start.isAfter(end);
        } catch (Exception e) {
            return false;
        }
    }

    public static class WeekPresets {
        private final LocalDate thisWeekStart;
        private final LocalDate thisWeekEnd;
        private final LocalDate nextWeekStart;
        private final LocalDate nextWeekEnd;

        public WeekPresets(LocalDate thisWeekStart, LocalDate thisWeekEnd, 
                          LocalDate nextWeekStart, LocalDate nextWeekEnd) {
            this.thisWeekStart = thisWeekStart;
            this.thisWeekEnd = thisWeekEnd;
            this.nextWeekStart = nextWeekStart;
            this.nextWeekEnd = nextWeekEnd;
        }

        public LocalDate getThisWeekStart() { return thisWeekStart; }
        public LocalDate getThisWeekEnd() { return thisWeekEnd; }
        public LocalDate getNextWeekStart() { return nextWeekStart; }
        public LocalDate getNextWeekEnd() { return nextWeekEnd; }
    }
}
