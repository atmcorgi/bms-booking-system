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
import java.util.*;
import java.util.stream.Collectors;

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
        if (slots == null || slots.isEmpty()) {
            return new CommitResult(0, 0, List.of());
        }

        long startTime = System.currentTimeMillis();
        logger.info("Starting batch commit for {} slots", slots.size());

        // Bước 1: Batch load tất cả entities cần thiết
        long t1 = System.currentTimeMillis();
        
        // Load theaters
        Set<Long> theaterIds = slots.stream()
            .filter(s -> s.getTheaterId() != null)
            .map(SchedulingUploadDto::getTheaterId)
            .collect(Collectors.toSet());
        Map<Long, Theater> theaterMap = new HashMap<>();
        if (!theaterIds.isEmpty()) {
            theaterRepository.findAllById(theaterIds).forEach(t -> theaterMap.put(t.getId(), t));
        }
        
        // Load rooms
        Set<Long> roomIds = slots.stream()
            .filter(s -> s.getRoomId() != null)
            .map(SchedulingUploadDto::getRoomId)
            .collect(Collectors.toSet());
        Map<Long, Room> roomMap = new HashMap<>();
        if (!roomIds.isEmpty()) {
            roomRepository.findAllById(roomIds).forEach(r -> roomMap.put(r.getId(), r));
        }
        
        // Load movies
        Set<Long> movieIds = slots.stream()
            .filter(s -> s.getMovieId() != null)
            .map(SchedulingUploadDto::getMovieId)
            .collect(Collectors.toSet());
        Map<Long, Movie> movieMap = new HashMap<>();
        if (!movieIds.isEmpty()) {
            movieRepository.findAllById(movieIds).forEach(m -> movieMap.put(m.getId(), m));
        }
        
        // Load movies by code
        Set<String> movieCodes = slots.stream()
            .filter(s -> s.getMovieCode() != null && s.getMovieId() == null)
            .map(SchedulingUploadDto::getMovieCode)
            .collect(Collectors.toSet());
        for (String code : movieCodes) {
            movieRepository.findByCode(code).ifPresent(m -> {
                movieMap.put(m.getId(), m);
            });
        }
        
        logger.debug("Batch load completed in {}ms. Theaters: {}, Rooms: {}, Movies: {}", 
            System.currentTimeMillis() - t1, theaterMap.size(), roomMap.size(), movieMap.size());

        // Bước 2: Load existing showtimes để check conflict (chỉ load 1 lần)
        t1 = System.currentTimeMillis();
        Set<LocalDate> dates = slots.stream()
            .map(SchedulingUploadDto::getShowDate)
            .filter(Objects::nonNull)
            .map(LocalDate::parse)
            .collect(Collectors.toSet());
        
        Set<Long> allRoomIds = roomMap.keySet();
        Map<String, List<Showtime>> existingByRoomAndDate = new HashMap<>();
        
        if (!dates.isEmpty() && !allRoomIds.isEmpty()) {
            for (Long roomId : allRoomIds) {
                for (LocalDate date : dates) {
                    String key = roomId + "_" + date;
                    existingByRoomAndDate.put(key, showtimeRepository.findByRoomIdAndShowDate(roomId, date));
                }
            }
        }
        logger.debug("Existing showtimes loaded in {}ms", System.currentTimeMillis() - t1);

        // Bước 3: Process từng slot với cache đã load
        List<Showtime> showtimesToSave = new ArrayList<>();
        List<MovieRequest> movieRequestsToUpdate = new ArrayList<>();
        Map<String, MovieRequest> mrUpdateCache = new HashMap<>(); // (movieCode, theaterId) -> MovieRequest
        List<String> errors = new ArrayList<>();

        for (SchedulingUploadDto slot : slots) {
            try {
                ProcessingResult result = processSingleSlotWithCache(
                    slot, theaterMap, roomMap, movieMap, existingByRoomAndDate, mrUpdateCache);
                
                if (result.showtime != null) {
                    showtimesToSave.add(result.showtime);
                }
                if (result.movieRequest != null) {
                    movieRequestsToUpdate.add(result.movieRequest);
                }
            } catch (Exception e) {
                String error = String.format("%s-%s-%s: %s",
                    slot.getTheaterName(), slot.getRoomName(), slot.getMovieCode(), e.getMessage());
                errors.add(error);
            }
        }

        // Bước 4: Batch save tất cả
        t1 = System.currentTimeMillis();
        if (!showtimesToSave.isEmpty()) {
            showtimeRepository.saveAll(showtimesToSave);
        }
        if (!movieRequestsToUpdate.isEmpty()) {
            movieRequestRepository.saveAll(movieRequestsToUpdate);
        }
        logger.debug("Batch save completed in {}ms. Showtimes: {}, MovieRequests: {}", 
            System.currentTimeMillis() - t1, showtimesToSave.size(), movieRequestsToUpdate.size());

        int successCount = showtimesToSave.size();
        int errorCount = errors.size();
        
        logger.info("Batch commit completed in {}ms. Success: {}, Errors: {}", 
            System.currentTimeMillis() - startTime, successCount, errorCount);

        return new CommitResult(successCount, errorCount, errors);
    }

    private ProcessingResult processSingleSlotWithCache(
            SchedulingUploadDto slot,
            Map<Long, Theater> theaterMap,
            Map<Long, Room> roomMap,
            Map<Long, Movie> movieMap,
            Map<String, List<Showtime>> existingByRoomAndDate,
            Map<String, MovieRequest> mrUpdateCache) {
        
        if (slot.getShowDate() == null || slot.getShowTime() == null) {
            throw new IllegalArgumentException("showDate và showTime không được null");
        }
        
        // Get theater
        Theater theater = null;
        if (slot.getTheaterId() != null) {
            theater = theaterMap.get(slot.getTheaterId());
        }
        if (theater == null && slot.getTheaterName() != null) {
            theater = theaterRepository.findByName(slot.getTheaterName());
        }
        if (theater == null) {
            throw new IllegalArgumentException("Rạp không tồn tại");
        }
        
        // Get room
        Room room = null;
        if (slot.getRoomId() != null) {
            room = roomMap.get(slot.getRoomId());
        }
        if (room == null && slot.getRoomName() != null && theater != null) {
            room = roomRepository.findByTheaterIdAndName(theater.getId(), slot.getRoomName()).orElse(null);
        }
        if (room == null) {
            throw new IllegalArgumentException("Phòng không tồn tại hoặc không thuộc rạp này");
        }
        
        // Get movie
        Movie movie = null;
        if (slot.getMovieId() != null) {
            movie = movieMap.get(slot.getMovieId());
        }
        if (movie == null && slot.getMovieCode() != null) {
            movie = movieRepository.findByCode(slot.getMovieCode()).orElse(null);
        }
        if (movie == null) {
            throw new IllegalArgumentException("Phim không tồn tại");
        }
        
        LocalDate date = LocalDate.parse(slot.getShowDate());
        LocalTime time = LocalTime.parse(slot.getShowTime());
        
        // Check conflict với cache đã load
        validateNoConflictWithCache(room, movie, date, time, existingByRoomAndDate);
        
        // Create showtime
        Showtime showtime = new Showtime();
        showtime.setTheater(theater);
        showtime.setRoom(room);
        showtime.setMovie(movie);
        showtime.setShowDate(date);
        showtime.setShowTime(time);
        showtime.setPriceStandard(slot.getPriceStandard() != null ? slot.getPriceStandard() : 75000);
        showtime.setPriceVip(slot.getPriceVip() != null ? slot.getPriceVip() : 100000);
        
        // Check MovieRequest
        MovieRequest movieRequestToUpdate = null;
        String mrKey = movie.getCode() + "_" + theater.getId();
        if (!mrUpdateCache.containsKey(mrKey)) {
            Optional<MovieRequest> mrOpt = movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theater.getId());
            if (mrOpt.isPresent() && "PENDING".equals(mrOpt.get().getStatus())) {
                movieRequestToUpdate = mrOpt.get();
                movieRequestToUpdate.setStatus("SCHEDULED");
                mrUpdateCache.put(mrKey, movieRequestToUpdate);
            }
        }
        
        return new ProcessingResult(showtime, movieRequestToUpdate);
    }
    
    private void validateNoConflictWithCache(Room room, Movie movie, LocalDate date, LocalTime time,
            Map<String, List<Showtime>> existingByRoomAndDate) {
        final int BUFFER_MINUTES = 5;
        
        String key = room.getId() + "_" + date;
        List<Showtime> existing = existingByRoomAndDate.getOrDefault(key, List.of());
        
        int newMovieDuration = movie.getDuration() > 0 ? movie.getDuration() : 120;
        LocalTime newEndTime = time.plusMinutes(newMovieDuration + BUFFER_MINUTES);
        
        for (Showtime existingShowtime : existing) {
            LocalTime existingStart = existingShowtime.getShowTime();
            
            // Check exact time match
            if (existingStart.equals(time)) {
                throw new IllegalArgumentException(String.format(
                    "Conflict: Phòng '%s' đã có suất chiếu '%s' vào %s %s",
                    room.getName(), 
                    existingShowtime.getMovie().getTitle(),
                    date, 
                    time
                ));
            }
            
            // Check overlap with duration + buffer
            int existingDuration = existingShowtime.getMovie().getDuration() > 0 
                ? existingShowtime.getMovie().getDuration() 
                : 120;
            LocalTime existingEndTime = existingStart.plusMinutes(existingDuration + BUFFER_MINUTES);
            
            boolean overlaps = time.isBefore(existingEndTime) && existingStart.isBefore(newEndTime);
            
            if (overlaps) {
                throw new IllegalArgumentException(String.format(
                    "Conflict: Phòng '%s' có suất '%s' (%s-%s) trùng với '%s' (%s-%s)",
                    room.getName(),
                    existingShowtime.getMovie().getTitle(),
                    existingStart,
                    existingEndTime.minusMinutes(BUFFER_MINUTES),
                    movie.getTitle(),
                    time,
                    newEndTime.minusMinutes(BUFFER_MINUTES)
                ));
            }
        }
    }

    private static class ProcessingResult {
        final Showtime showtime;
        final MovieRequest movieRequest;
        
        ProcessingResult(Showtime showtime, MovieRequest movieRequest) {
            this.showtime = showtime;
            this.movieRequest = movieRequest;
        }
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
