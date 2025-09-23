package fsa.training.observer;

import java.time.LocalDateTime;

/**
 * State object chứa thông tin về movie assignment
 */
public class MovieAssignmentState {
    private final Long movieId;
    private final String movieTitle;
    private final Long theaterId;
    private final String theaterName;
    private final String assignedBy;
    private final LocalDateTime assignedAt;
    private final String formats;
    private final String languages;
    
    public MovieAssignmentState(Long movieId, String movieTitle, Long theaterId, 
                               String theaterName, String assignedBy, LocalDateTime assignedAt,
                               String formats, String languages) {
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.assignedBy = assignedBy;
        this.assignedAt = assignedAt;
        this.formats = formats;
        this.languages = languages;
    }
    
    // Getters
    public Long getMovieId() { return movieId; }
    public String getMovieTitle() { return movieTitle; }
    public Long getTheaterId() { return theaterId; }
    public String getTheaterName() { return theaterName; }
    public String getAssignedBy() { return assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public String getFormats() { return formats; }
    public String getLanguages() { return languages; }
    
    @Override
    public String toString() {
        return String.format("MovieAssignmentState{movieId=%d, movieTitle='%s', theaterId=%d, theaterName='%s', assignedBy='%s', assignedAt=%s}",
                movieId, movieTitle, theaterId, theaterName, assignedBy, assignedAt);
    }
}
