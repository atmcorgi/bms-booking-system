package fsa.training.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDetailDto {
    private long id;
    private String name;
    private String supportedFormats;
    private long seatCount;
    private long showtimeCount;
}
