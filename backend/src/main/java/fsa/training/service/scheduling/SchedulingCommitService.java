package fsa.training.service.scheduling;

import fsa.training.dto.booking.SchedulingUploadDto;
import fsa.training.entity.*;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.booking.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchedulingCommitService {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MovieRequestRepository movieRequestRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

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
                // Debug log
                System.out.println("DEBUG: Exception in processSingleSlot: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                e.printStackTrace();
                
                String error = String.format("%s-%s-%s: %s", 
                    slot.getTheaterName(), slot.getRoomName(), slot.getMovieCode(), e.getMessage());
                errors.add(error);
                errorCount++;
            }
        }

        return new CommitResult(successCount, errorCount, errors);
    }

    private void processSingleSlot(SchedulingUploadDto slot) {
        // Debug log
        System.out.println("DEBUG: Processing slot - theaterId=" + slot.getTheaterId() +
            ", roomId=" + slot.getRoomId() +
            ", movieId=" + slot.getMovieId() +
            ", showDate=" + slot.getShowDate() +
            ", showTime=" + slot.getShowTime() +
            ", theaterName=" + slot.getTheaterName() +
            ", roomName=" + slot.getRoomName() +
            ", movieCode=" + slot.getMovieCode());
        
        // Validate required fields
        if (slot.getShowDate() == null || slot.getShowTime() == null) {
            throw new IllegalArgumentException("showDate và showTime không được null");
        }
        
        // Validate entities
        Theater theater = validateTheater(slot);
        Room room = validateRoom(slot, theater);
        Movie movie = validateMovie(slot);
        
        LocalDate date = LocalDate.parse(slot.getShowDate());
        LocalTime time = LocalTime.parse(slot.getShowTime());
        
        // Create showtime
        Showtime showtime = new Showtime();
        showtime.setTheater(theater);
        showtime.setRoom(room);
        showtime.setMovie(movie);
        showtime.setShowDate(date);
        showtime.setShowTime(time);
        showtime.setPriceStandard(slot.getPriceStandard() != null ? slot.getPriceStandard() : 75000);
        showtime.setPriceVip(slot.getPriceVip() != null ? slot.getPriceVip() : 100000);
        
        showtimeRepository.save(showtime);
        
        // Update movie request status if needed
        if (slot.getMovieRequestId() != null) {
            movieRequestRepository.findById(slot.getMovieRequestId())
                .ifPresent(request -> {
                    request.setStatus("SCHEDULED");
                    movieRequestRepository.save(request);
                });
        }
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
            // Debug log
            System.out.println("DEBUG: Theater validation failed for slot: " + 
                "theaterId=" + slot.getTheaterId() + 
                ", theaterName=" + slot.getTheaterName() + 
                ", roomName=" + slot.getRoomName() + 
                ", movieCode=" + slot.getMovieCode());
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
