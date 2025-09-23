package fsa.training.dto.movie;

import java.time.LocalDateTime;

public interface MovieRequestProjection {
    Long getId();
    String getMovieCode();
    String getTitle();
    String getDirector();
    Integer getDuration();
    String getStatus();
    Integer getPriority();
    Integer getDemandScore();
    String getFormats();
    String getLanguages();
    String getAllowedTheaters();
    LocalDateTime getCreatedAt();
    String getGenres(); // Concatenated string
}
