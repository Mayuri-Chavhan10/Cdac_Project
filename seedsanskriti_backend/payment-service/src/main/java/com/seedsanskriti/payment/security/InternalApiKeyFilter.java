package com.seedsanskriti.payment.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Guards every /internal/** endpoint.
 *
 * These endpoints are only ever meant to be called by main-service (the API
 * Gateway does not route to this service's /internal path at all - see the
 * gateway's application.yml). The real authorization decision is the
 * X-Internal-Api-Key shared secret, not the forwarded end-user JWT: the JWT
 * is only used, on a best-effort basis, to log which end user ultimately
 * triggered the call. A missing/invalid JWT is logged but does not reject
 * the request by itself - a missing/invalid internal API key does.
 */
@Slf4j
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${internal.api.key}")
    private String internalApiKey;

    private final JwtValidator jwtValidator;

    public InternalApiKeyFilter(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/internal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String providedKey = request.getHeader("X-Internal-Api-Key");

        if (providedKey == null || !providedKey.equals(internalApiKey)) {
            log.warn("Rejected call to {} - missing/invalid X-Internal-Api-Key", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"message\":\"Forbidden: this endpoint is for internal service-to-service use only\"}");
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String callerEmail = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            callerEmail = jwtValidator.extractSubjectIfValid(authHeader.substring(7));
        }

        if (callerEmail == null) {
            log.info("Internal call to {} without a resolvable end-user JWT (may be a system call)",
                    request.getRequestURI());
        }

        // Mark the request as authenticated for Spring Security's filter
        // chain purposes - the real gate already happened above.
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        callerEmail != null ? callerEmail : "main-service",
                        null,
                        java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
