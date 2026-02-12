package fsa.training.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private Object content;
    private boolean hasMore;
    private int page;
    private int totalPages;
    private long totalItems;
    private int size;

    public static <T> Map<String, Object> fromPage(Page<T> page) {
        Map<String, Object> response = new HashMap<>();
        response.put("content", page.getContent());
        response.put("hasMore", !page.isLast());
        response.put("page", page.getNumber());
        response.put("totalPages", page.getTotalPages());
        response.put("totalItems", page.getTotalElements());
        response.put("size", page.getSize());
        return response;
    }
}
