package com.novacart.gateway.security;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Verification-only — the Gateway loads just the public key, never the private one.
 * Duplicated (not shared via novacart-common) deliberately: it's a few lines of
 * infrastructure code, and novacart-common is DTOs/events only per its own discipline
 * rule, not a place for security utilities shared across independently-owned services.
 */
final class PublicKeyLoader {

    private PublicKeyLoader() {
    }

    static RSAPublicKey load(String path) {
        try {
            byte[] keyBytes = stripPem(Files.readString(Path.of(path)));
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read JWT public key at " + path, e);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("JWT public key at " + path + " is not a valid X.509 RSA key", e);
        }
    }

    private static byte[] stripPem(String pem) {
        String base64 = pem
            .replaceAll("-----BEGIN (.*)-----", "")
            .replaceAll("-----END (.*)-----", "")
            .replaceAll("\\s", "");
        return Base64.getDecoder().decode(base64);
    }
}
