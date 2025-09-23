package fsa.training.service.admin;

import fsa.training.dto.movie.MovieStatusProjection;
import fsa.training.dto.movie.MovieRequestProjection;
import fsa.training.service.movie.MovieService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;

@Service
public class MovieWorkflowService {

    private static final int DASHBOARD_PAGE_SIZE = 20;

    private final MovieService movieService;

    public MovieWorkflowService(MovieService movieService) {
        this.movieService = movieService;
    }

    /**
     * Get dashboard statistics for ADMIN 
     */
    @Transactional(readOnly = true)
    public DashboardStatistics getDashboardStatistics() {
        long draftCount = movieService.getMovieCountByStatus("DRAFT");
        long publishedCount = movieService.getMovieCountByStatus("PUBLISHED");
        
        Page<MovieStatusProjection> recentDraftPage = movieService.getWorkflowProjectionsByStatus("DRAFT", 0, DASHBOARD_PAGE_SIZE);
        Page<MovieStatusProjection> recentPublishedPage = movieService.getWorkflowProjectionsByStatus("PUBLISHED", 0, DASHBOARD_PAGE_SIZE);

        List<MovieStatusProjection> draftMovies = recentDraftPage.getContent();
        List<MovieStatusProjection> publishedMovies = recentPublishedPage.getContent();

        return new DashboardStatistics(
            java.util.List.of(), java.util.List.of(), draftMovies, publishedMovies,
            0, 0, (int)draftCount, (int)publishedCount
        );
    }

    @Transactional(readOnly = true)
    public DashboardStatistics getDashboardStatisticsForTheater(Long theaterId) {
        // New workflow: only assigned and published movies matter for STAFF
        long assignedCount = movieService.countAssignedMoviesByTheater(theaterId);
        long publishedCount = movieService.countMoviesByStatusAndTheater("PUBLISHED", theaterId);

        Page<MovieStatusProjection> recentAssignedPage = movieService.getAssignedMoviesByTheater(theaterId, 0, DASHBOARD_PAGE_SIZE);
        Page<MovieStatusProjection> recentPublishedPage = movieService.getWorkflowProjectionsByStatusAndTheater("PUBLISHED", theaterId, 0, DASHBOARD_PAGE_SIZE);

        List<MovieStatusProjection> assignedMovies = recentAssignedPage.getContent();
        List<MovieStatusProjection> publishedMovies = recentPublishedPage.getContent();

        return new DashboardStatistics(
            java.util.List.of(), java.util.List.of(), assignedMovies, publishedMovies,
            0, 0, (int)assignedCount, (int)publishedCount
        );
    }

    /**
     * Get workflow overview data
     */
    @Transactional(readOnly = true)
    public WorkflowOverview getWorkflowOverview() {
        Page<MovieStatusProjection> allMoviesPage = movieService.getWorkflowProjectionsByStatus("DRAFT", 0, DASHBOARD_PAGE_SIZE);
        return new WorkflowOverview(allMoviesPage.getContent(), java.util.List.of());
    }

    /**
     * Prepare scheduling information for assigned movies (new workflow)
     */
    public ApprovalResult prepareSchedulingInfo(List<Long> movieIds) {
        String codesCsv = String.join(",", movieIds.stream().map(String::valueOf).collect(Collectors.toList()));
        String scheduleUrl = "/staff/scheduling/auto?codes=" + codesCsv;
        return new ApprovalResult(codesCsv, scheduleUrl);
    }

    /**
     * Inner class to hold dashboard statistics
     */
    public static class DashboardStatistics {
        private final List<MovieRequestProjection> pendingRequests;
        private final List<MovieRequestProjection> approvedRequests;
        private final List<MovieStatusProjection> scheduledMovies;
        private final List<MovieStatusProjection> publishedMovies;
        private final int pendingCount;
        private final int approvedCount;
        private final int scheduledCount;
        private final int publishedCount;

        public DashboardStatistics(List<MovieRequestProjection> pendingRequests,
                                   List<MovieRequestProjection> approvedRequests,
                                   List<MovieStatusProjection> scheduledMovies,
                                   List<MovieStatusProjection> publishedMovies,
                                   int pendingCount, int approvedCount, int scheduledCount, int publishedCount) {
            this.pendingRequests = pendingRequests;
            this.approvedRequests = approvedRequests;
            this.scheduledMovies = scheduledMovies;
            this.publishedMovies = publishedMovies;
            this.pendingCount = pendingCount;
            this.approvedCount = approvedCount;
            this.scheduledCount = scheduledCount;
            this.publishedCount = publishedCount;
        }

        public List<MovieRequestProjection> getPendingRequests() { return pendingRequests; }
        public List<MovieRequestProjection> getApprovedRequests() { return approvedRequests; }
        public List<MovieStatusProjection> getScheduledMovies() { return scheduledMovies; }
        public List<MovieStatusProjection> getPublishedMovies() { return publishedMovies; }
        public int getPendingCount() { return pendingCount; }
        public int getApprovedCount() { return approvedCount; }
        public int getScheduledCount() { return scheduledCount; }
        public int getPublishedCount() { return publishedCount; }
    }

    /**
     * Inner class to hold approval result
     */
    public static class ApprovalResult {
        private final String codesCsv;
        private final String scheduleUrl;

        public ApprovalResult(String codesCsv, String scheduleUrl) {
            this.codesCsv = codesCsv;
            this.scheduleUrl = scheduleUrl;
        }

        public String getCodesCsv() { return codesCsv; }
        public String getScheduleUrl() { return scheduleUrl; }
    }

    /**
     * Inner class to hold workflow overview
     */
    public static class WorkflowOverview {
        private final List<MovieStatusProjection> allMovies;
        private final List<MovieRequestProjection> allRequests;

        public WorkflowOverview(List<MovieStatusProjection> allMovies, List<MovieRequestProjection> allRequests) {
            this.allMovies = allMovies;
            this.allRequests = allRequests;
        }

        public List<MovieStatusProjection> getAllMovies() { return allMovies; }
        public List<MovieRequestProjection> getAllRequests() { return allRequests; }
    }
}
