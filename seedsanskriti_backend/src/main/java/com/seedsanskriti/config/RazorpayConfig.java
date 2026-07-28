package com.seedsanskriti.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

/**
 * Exposes a singleton {@link RazorpayClient} built from the key id/secret
 * supplied via environment variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET),
 * see application.properties. Nothing here is hardcoded.
 *
 * The bean is {@code @Lazy} on purpose: if the Razorpay env vars haven't been
 * configured yet, the rest of the application (every other existing feature)
 * must still start up and work normally. The client is only constructed the
 * first time a Razorpay endpoint is actually invoked.
 */
@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Bean
    @Lazy
    public RazorpayClient razorpayClient() throws RazorpayException {
        return new RazorpayClient(keyId, keySecret);
    }
}
