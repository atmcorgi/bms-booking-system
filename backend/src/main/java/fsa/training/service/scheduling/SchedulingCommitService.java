package fsa.training.service.scheduling;

import fsa.training.dto.booking.SchedulingUploadDto;
import fsa.training.entity.*;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.booking.ShowtimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchedulingCommitService {

    private static final Logger logger = LoggerFactory.getLogger(SchedulingCommitService.class);

    @Autowired
    private TheaterRepository theaterRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    @Autowired
    private MovieRequestRepository movieRequestRepository;

    @Transactional
    public CommitResult processCommitSlots(List<SchedulingUploadDto> slots) {
        int successCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();

        for (SchedulingUploadDto slot : slots) {
            try {
                processSingleSlot(slot);
                successCount++;
            } catch (Exception e) {
                String error = String.format("%s-%s-%s: %s",
                    slot.getTheaterName(), slot.getRoomName(), slot.getMovieCode(), e.getMessage());
                errors.add(error);
                errorCount++;
            }
        }

        return new CommitResult(successCount, errorCount, errors);
    }

    private void processSingleSlot(SchedulingUploadDto slot) {
        if (slot.getShowDate() == null || slot.getShowTime() == null) {
            throw new IllegalArgumentException("showDate và showTime không được null");
        }
        
        Theater theater = validateTheater(slot);
        Room room = validateRoom(slot, theater);
        Movie movie = validateMovie(slot);
        
        LocalDate date = LocalDate.parse(slot.getShowDate());
        LocalTime time = LocalTime.parse(slot.getShowTime());
        
        // ✅ FIX: Check conflict with existing showtimes
        validateNoConflict(room, movie, date, time);
        
        Showtime showtime = new Showtime();
        showtime.setTheater(theater);
        showtime.setRoom(room);
        showtime.setMovie(movie);
        showtime.setShowDate(date);
        showtime.setShowTime(time);
        showtime.setPriceStandard(slot.getPriceStandard() != null ? slot.getPriceStandard() : 75000);
        showtime.setPriceVip(slot.getPriceVip() != null ? slot.getPriceVip() : 100000);
        
        showtimeRepository.save(showtime);
        
        // --- CORRECT WORKFLOW LOGIC ---
        // Find the corresponding MovieRequest and update its status if it's PENDING
        movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theater.getId())
                .ifPresent(request -> {
                    if ("PENDING".equals(request.getStatus())) {
                        request.setStatus("SCHEDULED");
                        movieRequestRepository.save(request);
                        logger.info("✅ Scheduling: MovieRequest for '{}' at theater '{}' status updated to SCHEDULED.",
                                movie.getTitle(), theater.getName());
                    }
                });
        // --- END CORRECT WORKFLOW LOGIC ---
    }
    
    private Theater validateTheater(SchedulingUploadDto slot) {
        Theater theater = null;
        if (slot.getTheaterId() != null) {
            theater = theaterRepository.findById(slot.getTheaterId()).orElse(null);
        }
        if (theater == null && slot.getTheaterName() != null) {
            theater = theaterRepository.findByName(slot.getTheaterName());
        }
        if (theater == null) {
            throw new IllegalArgumentException("Rạp không tồn tại");
        }
        return theater;
    }
    
    private Room validateRoom(SchedulingUploadDto slot, Theater theater) {
        if (slot.getRoomId() != null) {
            return roomRepository.findById(slot.getRoomId())
                .filter(room -> room.getTheater().getId().equals(theater.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại hoặc không thuộc rạp này"));
        }
        if (slot.getRoomName() != null) {
            return roomRepository.findByTheaterIdAndName(theater.getId(), slot.getRoomName())
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại"));
        }
        throw new IllegalArgumentException("Thiếu thông tin phòng");
    }
    
    private Movie validateMovie(SchedulingUploadDto slot) {
        if (slot.getMovieId() != null) {
            return movieRepository.findById(slot.getMovieId())
                .orElseThrow(() -> new IllegalArgumentException("Phim không tồn tại"));
        }
        if (slot.getMovieCode() != null) {
            return movieRepository.findByCode(slot.getMovieCode())
                .orElseThrow(() -> new IllegalArgumentException("Phim không tồn tại"));
        }
        throw new IllegalArgumentException("Thiếu thông tin phim");
    }
    
    /**
     * Validates that there's no conflict with existing showtimes.
     * Checks both exact time match and overlap with movie duration + buffer.
     */
    private void validateNoConflict(Room room, Movie movie, LocalDate date, LocalTime time) {
        final int BUFFER_MINUTES = 15; // Cleanup time between movies
        
        // Get all existing showtimes for this room on this date
        List<Showtime> existingShowtimes = showtimeRepository.findByRoomIdAndShowDate(room.getId(), date);
        
        int newMovieDuration = movie.getDuration() > 0 ? movie.getDuration() : 120;
        LocalTime newEndTime = time.plusMinutes(newMovieDuration + BUFFER_MINUTES);
        
        for (Showtime existing : existingShowtimes) {
            LocalTime existingStart = existing.getShowTime();
            
            // Check exact time match
            if (existingStart.equals(time)) {
                throw new IllegalArgumentException(String.format(
                    "Conflict: Phòng '%s' đã có suất chiếu '%s' vào %s %s",
                    room.getName(), 
                    existing.getMovie().getTitle(),
                    date, 
                    time
                ));
            }
            
            // Check overlap with duration + buffer
            int existingDuration = existing.getMovie().getDuration() > 0 
                ? existing.getMovie().getDuration() 
                : 120;
            LocalTime existingEndTime = existingStart.plusMinutes(existingDuration + BUFFER_MINUTES);
            
            // Overlap if: newStart < existingEnd AND existingStart < newEnd
            boolean overlaps = time.isBefore(existingEndTime) && existingStart.isBefore(newEndTime);
            
            if (overlaps) {
                throw new IllegalArgumentException(String.format(
                    "Conflict: Phòng '%s' có suất '%s' (%s-%s) trùng với '%s' (%s-%s)",
                    room.getName(),
                    existing.getMovie().getTitle(),
                    existingStart,
                    existingEndTime.minusMinutes(BUFFER_MINUTES), // Show actual movie end
                    movie.getTitle(),
                    time,
                    newEndTime.minusMinutes(BUFFER_MINUTES)
                ));
            }
        }
        
        logger.debug("✅ No conflict: Room '{}' is available at {} on {}", 
            room.getName(), time, date);
    }

    public static class CommitResult {
        private final int successCount;
        private final int errorCount;
        private final List<String> errors;
        
        public CommitResult(int successCount, int errorCount, List<String> errors) {
            this.successCount = successCount;
            this.errorCount = errorCount;
            this.errors = errors;
        }
        
        public int getSuccessCount() { return successCount; }
        public int getErrorCount() { return errorCount; }
        public List<String> getErrors() { return errors; }
    }
}
