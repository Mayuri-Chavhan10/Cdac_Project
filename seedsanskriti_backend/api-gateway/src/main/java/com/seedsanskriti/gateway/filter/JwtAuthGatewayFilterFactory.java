package com.seedsanskriti.gateway.filter;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

/**
 * Gateway-level JWT gate.
 *
 * This is a fast, coarse-grained "reject obviously bad/missing tokens
 * before they even reach a downstream service" check. It is NOT a
 * replacement for main-service's own Spring Security + JwtAuthenticationFilter
 * (that remains the source of truth for role-based authorization on every
 * endpoint) - it is defense in depth, and it also gives us one place to add
 * gateway-level concerns later (rate limiting per user, request logging with
 * the caller's identity, etc).
 *
 * Applied to routes via the "JwtAuth" filter name in application.yml. Routes
 * that must stay public (auth endpoints, public product/category browsing)
 * simply don't list this filter.
 */
@Component
public class JwtAuthGatewayFilterFactory
        extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    @Value("${jwt.secret}")
    private String secretKey;

    public JwtAuthGatewayFilterFactory() {
        super(Config.class);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // GET on public browsing endpoints stays open even under a
            // prefix that otherwise requires auth (mirrors main-service's
            // own SecurityConfig rule for GET /api/products/** and
            // GET /api/reviews/**).
            if (request.getMethod() != null
                    && request.getMethod().name().equals("GET")
                    && PUBLIC_GET_PREFIXES.stream().anyMatch(path::startsWith)) {
                return chain.filter(exchange);
            }

            List<String> authHeaders = request.getHeaders().get("Authorization");
            String token = null;
            if (authHeaders != null && !authHeaders.isEmpty() && authHeaders.get(0).startsWith("Bearer ")) {
                token = authHeaders.get(0).substring(7);
            }

            if (token == null || !isValid(token)) {
                return unauthorized(exchange);
            }

            return chain.filter(exchange);
        };
    }

    private boolean isValid(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getExpiration() == null || claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        byte[] body = "{\"message\":\"Missing or invalid authentication token\"}"
                .getBytes(StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body)));
    }

    private static final Set<String> PUBLIC_GET_PREFIXES = Set.of(
            "/api/products",
            "/api/reviews");

    public static class Config {
        // No per-route configuration needed today; kept as an extension
        // point (e.g. required roles) without changing the filter's name
        // used in application.yml.
    }
}
