package fsa.training.dto.admin;

import fsa.training.entity.MediaType;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BannerDto {
    private String title;
    private MediaType mediaType;
    private String mediaUrl;
    private String imageUrl;
    private String thumbnailUrl;
    private String linkUrl;
    private Integer displayOrder;
    private Boolean isActive;
    private String startDate;
    private String endDate;
}
