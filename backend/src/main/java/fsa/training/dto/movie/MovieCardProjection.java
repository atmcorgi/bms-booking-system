package fsa.training.dto.movie;

import java.time.LocalDate;

public interface MovieCardProjection {
    Long getId();
    String getTitle();
    String getPosterUrl();
    Integer getDuration();
    String getAgeRating();
    LocalDate getReleaseDate();
    String getDirector();
    String getGenres(); // Concatenated string from GROUP_CONCAT
}
