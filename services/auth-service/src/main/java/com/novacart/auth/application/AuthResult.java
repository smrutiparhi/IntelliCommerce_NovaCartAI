package com.novacart.auth.application;

import com.novacart.auth.domain.User;

/** Internal — {@code rawRefreshToken} never appears in a JSON body, only in the httpOnly cookie the controller sets. */
public record AuthResult(
    User user,
    String accessToken,
    String rawRefreshToken,
    long refreshTokenValiditySeconds
) {
}
