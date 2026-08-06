package com.novacart.auth.domain.exception;

public class SelfServiceAdminException extends RuntimeException {
    public SelfServiceAdminException() {
        super("ROLE_ADMIN cannot be self-assigned at registration");
    }
}
