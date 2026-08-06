package com.novacart.auth.api;

import org.mapstruct.Mapper;

import com.novacart.auth.api.dto.UserResponse;
import com.novacart.auth.domain.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
