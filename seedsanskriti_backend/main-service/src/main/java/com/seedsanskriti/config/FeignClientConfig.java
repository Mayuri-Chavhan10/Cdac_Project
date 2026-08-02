package com.seedsanskriti.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Every outgoing Feign call to the Payment Service carries two headers:
 *
 *  - Authorization: the same end-user JWT that was presented to the Main
 *    Service, forwarded as-is. The Payment Service validates it (same
 *    jwt.secret on both sides) purely to know which authenticated caller
 *    ultimately triggered the request, for logging/traceability.
 *
 *  - X-Internal-Api-Key: a shared secret known only to Main Service and
 *    Payment Service. This is what actually authorizes the call - the
 *    Payment Service's internal endpoints are NOT meant to be reachable
 *    directly by end users or through the API Gateway, only service-to-
 *    service. See payment-service's InternalApiKeyFilter.
 */
public class FeignClientConfig {

    @Value("${internal.api.key}")
    private String internalApiKey;

    @Bean
    public RequestInterceptor internalAuthForwardingInterceptor() {
        return requestTemplate -> {

            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");

                if (authHeader != null) {
                    requestTemplate.header("Authorization", authHeader);
                }
            }

            requestTemplate.header("X-Internal-Api-Key", internalApiKey);
        };
    }
}
