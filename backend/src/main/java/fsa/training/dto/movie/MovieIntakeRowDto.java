package fsa.training.dto.movie;

import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieIntakeRowDto {
    private int rowNumber;
    private String movieCode;
    private String title;
    private String description;
    private String posterUrl;
    private Integer durationMin;
    private String director;
    private String actors;
    private LocalDate releaseDate;
    private String ageRating;
    private String formats;   // e.g., "2D|3D"
    private String languages; // e.g., "VI|EN"
    private Integer priority;
    private Double demandScore;
    private String trailerUrl;
    private String youtubeUrl;
    private List<String> genreNames = new ArrayList<>();

    // CSV of theater names/codes allowed (e.g., "CGV Vincom|BHD Bitexco")
    private String allowedTheaters;

    @Builder.Default
    private List<String> errors = new ArrayList<>();
}


