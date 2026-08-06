package com.novacart.auth.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.novacart.auth.domain.exception.EmailAlreadyExistsException;
import com.novacart.auth.domain.exception.InvalidCredentialsException;
import com.novacart.auth.domain.exception.InvalidTokenException;
import com.novacart.auth.domain.exception.SelfServiceAdminException;
import com.novacart.auth.domain.exception.UserNotFoundException;
import com.novacart.common.dto.ApiErrorDetail;
import com.novacart.common.dto.ApiErrorResponse;
import com.novacart.common.dto.ApiFieldError;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String ERROR_TYPE_BASE = "https://novacart.ai/errors/";

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailExists(EmailAlreadyExistsException ex, WebRequest request) {
        return build(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", ex.getMessage(), null, request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex, WebRequest request) {
        return build(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", ex.getMessage(), null, request);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidToken(InvalidTokenException ex, WebRequest request) {
        return build(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", ex.getMessage(), null, request);
    }

    @ExceptionHandler(SelfServiceAdminException.class)
    public ResponseEntity<ApiErrorResponse> handleSelfServiceAdmin(SelfServiceAdminException ex, WebRequest request) {
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN_ROLE", ex.getMessage(), null, request);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(UserNotFoundException ex, WebRequest request) {
        return build(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", ex.getMessage(), null, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        List<ApiFieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new ApiFieldError(fe.getField(), fe.getDefaultMessage()))
            .toList();
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "One or more fields are invalid", fieldErrors, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex, WebRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred", null, request);
    }

    private ResponseEntity<ApiErrorResponse> build(
        HttpStatus status,
        String code,
        String message,
        List<ApiFieldError> fieldErrors,
        WebRequest request
    ) {
        ApiErrorDetail detail = new ApiErrorDetail(code, message, ERROR_TYPE_BASE + code.toLowerCase().replace('_', '-'), fieldErrors);
        String traceId = request.getHeader("X-Trace-Id");
        ApiErrorResponse body = ApiErrorResponse.of(detail, traceId != null ? traceId : UUID.randomUUID().toString());
        return ResponseEntity.status(status).body(body);
    }
}
