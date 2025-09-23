package fsa.training.service.staff;

import fsa.training.dto.movie.MovieStatusProjection;
import fsa.training.entity.Theater;
import fsa.training.service.movie.MovieService;
import fsa.training.service.theater.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service để xử lý business logic cho staff workflow
 */
@Service
public class StaffWorkflowService {

    @Autowired
    private MovieService movieService;

    @Autowired
    private TheaterService theaterService;

    /**
     * Lấy theater được assign cho user (logic tái sử dụng)
     */
    public Theater getAssignedTheater(String username) {
        List<Theater> theaters = theaterService.getTheatersForUser(username);
        if (theaters == null || theaters.isEmpty()) {
            return null;
        }
        return theaters.get(0);
    }

    /**
     * Lấy theater ID được assign cho user
     */
    public Long getAssignedTheaterId(String username) {
        Theater theater = getAssignedTheater(username);
        return theater != null ? theater.getId() : null;
    }

    /**
     * Lấy dashboard statistics cho staff
     */
    public StaffDashboardStats getDashboardStats(String username) {
        Long theaterId = getAssignedTheaterId(username);
        
        if (theaterId == null) {
            return new StaffDashboardStats(0, 0, 0, 0);
        }

        int assignedCount = movieService.countAssignedMoviesByTheater(theaterId);
        int scheduledCount = (int) movieService.countMoviesByStatusAndTheater("SCHEDULED", theaterId);
        int publishedCount = (int) movieService.countMoviesByStatusAndTheater("PUBLISHED", theaterId);
        int totalItems = assignedCount + scheduledCount + publishedCount;

        return new StaffDashboardStats(assignedCount, scheduledCount, publishedCount, totalItems);
    }

    /**
     * Lấy danh sách phim đã assign
     */
    public Page<MovieStatusProjection> getAssignedMovies(String username, int page, int size) {
        Long theaterId = getAssignedTheaterId(username);
        if (theaterId == null) {
            return Page.empty();
        }
        return movieService.getAssignedMoviesByTheater(theaterId, page, size);
    }

    /**
     * Lấy TẤT CẢ phim đã được assign cho theater (bất kể status)
     */
    public Page<MovieStatusProjection> getAllAssignedMovies(String username, int page, int size) {
        Long theaterId = getAssignedTheaterId(username);
        if (theaterId == null) {
            return Page.empty();
        }
        return movieService.getAllAssignedMoviesByTheater(theaterId, page, size);
    }

    /**
     * Lấy danh sách phim theo status
     */
    public Page<MovieStatusProjection> getMoviesByStatus(String username, String status, int page, int size) {
        Long theaterId = getAssignedTheaterId(username);
        if (theaterId == null) {
            return Page.empty();
        }
        
        Page<MovieStatusProjection> movies = movieService.getWorkflowProjectionsByStatusAndTheater(status, theaterId, page, size);
        return movies != null ? movies : Page.empty();
    }

    /**
     * DTO cho dashboard statistics
     */
    public static class StaffDashboardStats {
        private final int assignedCount;
        private final int scheduledCount;
        private final int publishedCount;
        private final int totalItems;

        public StaffDashboardStats(int assignedCount, int scheduledCount, int publishedCount, int totalItems) {
            this.assignedCount = assignedCount;
            this.scheduledCount = scheduledCount;
            this.publishedCount = publishedCount;
            this.totalItems = totalItems;
        }

        // Getters
        public int getAssignedCount() { return assignedCount; }
        public int getScheduledCount() { return scheduledCount; }
        public int getPublishedCount() { return publishedCount; }
        public int getTotalItems() { return totalItems; }
    }
}
