package fsa.training.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class SepayConfig {
    @Value("${sepay.bank.acc:}")
    private String bankAcc;

    @Value("${sepay.bank.name:}")
    private String bankName;

    @Value("${sepay.api.key:}")
    private String apiKey;

    @Value("${sepay.merchant.id:}")
    private String merchantId;

    @Value("${sepay.secret.key:}")
    private String secretKey;
}
