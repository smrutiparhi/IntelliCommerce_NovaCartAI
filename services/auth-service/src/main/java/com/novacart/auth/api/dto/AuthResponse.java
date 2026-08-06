package com.novacart.auth.api.dto;

public record AuthResponse(
    UserResponse user,
    String accessToken
) {
}
