package fsa.training.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.ZoneId;

@Configuration
public class AppTimeConfig {

    @Bean
    public ZoneId businessZoneId() {
        // Dùng cho nghiệp vụ hiển thị ở VN khi cần
        return ZoneId.of("Asia/Ho_Chi_Minh");
    }
}


