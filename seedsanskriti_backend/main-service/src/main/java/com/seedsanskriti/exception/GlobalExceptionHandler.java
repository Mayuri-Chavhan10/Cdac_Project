package com.seedsanskriti.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = new ApiErrorResponse();

        error.setTimestamp(LocalDateTime.now());
        error.setStatus(ex.getStatusCode().value());
        error.setError(ex.getStatusCode().toString());
        error.setMessage(ex.getReason());
        error.setPath(request.getRequestURI());

        return new ResponseEntity<>(error, ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(),
                    fieldError.getDefaultMessage());
        }

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = new ApiErrorResponse();

        error.setTimestamp(LocalDateTime.now());
        error.setStatus(HttpStatus.FORBIDDEN.value());
        error.setError("FORBIDDEN");
        error.setMessage("Access Denied");
        error.setPath(request.getRequestURI());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleException(
            Exception ex,
            HttpServletRequest request) {

        // Log the full exception server-side for debugging...
        log.error("Unhandled exception while processing {} {}",
                request.getMethod(), request.getRequestURI(), ex);

        // ...but never expose internal details (SQL errors, stack traces,
        // class names, etc.) to the client.
        ApiErrorResponse error = new ApiErrorResponse();

        error.setTimestamp(LocalDateTime.now());
        error.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.setError("INTERNAL_SERVER_ERROR");
        error.setMessage("Something went wrong. Please try again later.");
        error.setPath(request.getRequestURI());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error);
    }
}