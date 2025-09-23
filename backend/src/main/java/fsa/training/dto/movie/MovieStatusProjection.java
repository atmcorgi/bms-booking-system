package fsa.training.dto.movie;

import java.time.LocalDate;

public interface MovieStatusProjection {
    Long getId();
    String getCode();
    String getTitle();
    String getDirector();
    Integer getDuration();
    String getStatus();
    LocalDate getReleaseDate();
    String getGenres(); // Concatenated string
    Integer getShowtimeCount(); // Count of associated showtimes
    String getFormats(); // From movie_assignment
    String getLanguages(); // From movie_assignment
}