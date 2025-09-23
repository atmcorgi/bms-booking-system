package fsa.training.dto.theater;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistrictDto {
    private Long id;
    private String name;
    private String code;
    private Double latitude;
    private Double longitude;
    private Long provinceId;
} 