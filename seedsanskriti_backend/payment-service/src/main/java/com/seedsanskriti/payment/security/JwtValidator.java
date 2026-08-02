package com.seedsanskriti.payment.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Lightweight counterpart of main-service's JwtUtil. This service never
 * issues tokens (only main-service's AuthService does) - it only needs to
 * verify a token's signature/expiry and read the subject (email) out of it,
 * purely for audit logging of who ultimately triggered a payment. It does
 * NOT look up a User row (this service has no Users table) and does NOT
 * drive Spring Security's authorization decisions - the actual authorization
 * for /internal/** is the shared-secret check in {@link InternalApiKeyFilter}.
 */
@Component
public class JwtValidator {

    @Value("${jwt.secret}")
    private String secretKey;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Returns the token's subject (email) if it is well-formed, signed with
     * our shared secret, and not expired - or null if the token is missing/
     * invalid. A null/invalid token is logged but does not by itself reject
     * the request; see InternalApiKeyFilter for why.
     */
    public String extractSubjectIfValid(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (claims.getExpiration() != null && claims.getExpiration().before(new Date())) {
                return null;
            }

            return claims.getSubject();

        } catch (JwtException | IllegalArgumentException ex) {
            return null;
        }
    }
}
