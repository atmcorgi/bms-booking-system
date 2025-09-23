package fsa.training.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class NotificationMarkReadRequest {
    
    @NotNull(message = "IDs cannot be null")
    @NotEmpty(message = "IDs cannot be empty")
    private List<Long> ids;
}
