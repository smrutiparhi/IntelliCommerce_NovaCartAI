package com.novacart.auth.api.dto;

import java.util.Set;

import com.novacart.auth.domain.Role;

public record UserResponse(
    String id,
    String email,
    String fullName,
    Set<Role> roles
) {
}
