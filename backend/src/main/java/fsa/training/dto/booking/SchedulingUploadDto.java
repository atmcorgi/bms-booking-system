package fsa.training.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulingUploadDto {
    // Preferred identifiers
    private Long theaterId;
    private Long roomId;
    private Long movieId;
    private Long movieRequestId;

    private String theaterName;
    private String roomName;
    private String movieCode;
    private String showDate;     // yyyy-MM-dd
    private String showTime;     // HH:mm
    private Integer priceStandard;
    private Integer priceVip;
    private Integer duration;    // Movie duration in minutes

    private boolean valid = true;
    private List<String> errors = new ArrayList<>();

    public void addError(String error) {
        this.errors.add(error);
        this.valid = false;
    }
}


