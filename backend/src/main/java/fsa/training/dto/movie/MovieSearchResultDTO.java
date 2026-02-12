package fsa.training.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieSearchResultDTO {
    private Map<String, Object> nowShowing;
    private Map<String, Object> comingSoon;

    public MovieSearchResultDTO(Page<MovieCardProjection> nowShowingPage, Page<MovieCardProjection> comingSoonPage) {
        this.nowShowing = PagedResponse.fromPage(nowShowingPage);
        this.comingSoon = PagedResponse.fromPage(comingSoonPage);
    }
}
