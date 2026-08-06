package com.novacart.auth.infrastructure.security;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/** Reads PKCS8 (private) / X.509 (public) PEM files — generated once via openssl, never committed. */
final class RsaKeyLoader {

    private RsaKeyLoader() {
    }

    static RSAPrivateKey loadPrivateKey(String path) {
        try {
            byte[] keyBytes = stripPem(Files.readString(Path.of(path)));
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(spec);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read JWT private key at " + path, e);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("JWT private key at " + path + " is not a valid PKCS8 RSA key", e);
        }
    }

    static RSAPublicKey loadPublicKey(String path) {
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
