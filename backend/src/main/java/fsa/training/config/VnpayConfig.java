package fsa.training.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class VnpayConfig {
    @Value("${demo.vnpay.tmnCode}")
    private String tmnCode;
    @Value("${demo.vnpay.hashSecret}")
    private String hashSecret;
    @Value("${demo.vnpay.payUrl}")
    private String payUrl;
    @Value("${demo.vnpay.returnUrl}")
    private String returnUrl;
    @Value("${demo.vnpay.ipnUrl}")
    private String ipnUrl;
}