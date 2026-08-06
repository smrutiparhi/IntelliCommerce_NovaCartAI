package com.novacart.auth.domain.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String userId) {
        super("User " + userId + " not found");
    }
}
