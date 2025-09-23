package fsa.training.dto.staff;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovieRequestCreateDto {
    @NotNull
    private Long movieId;

    // Optional prefer: override formats/languages/priority if needed in future
    private Integer priority;
    private Double demandScore;
}


