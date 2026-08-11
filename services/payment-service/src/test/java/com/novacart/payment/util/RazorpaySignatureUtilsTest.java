package com.novacart.payment.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RazorpaySignatureUtilsTest {

    private final String secret = "mockWebhookSecret13579";

    @Test
    @DisplayName("Valid signature should be verified successfully")
    void testValidSignatureVerification() throws Exception {
        String payload = "{\"event\":\"payment.captured\",\"payment_id\":\"pay_12345\"}";
        String validSignature = RazorpaySignatureUtils.calculateHmacSha256(payload, secret);

        boolean result = RazorpaySignatureUtils.verifySignature(payload, validSignature, secret);
        assertTrue(result, "Valid signature must pass verification");
    }

    @Test
    @DisplayName("Tampered payload should fail signature verification")
    void testTamperedPayloadSignatureVerification() throws Exception {
        String originalPayload = "{\"event\":\"payment.captured\",\"amount\":50000}";
        String validSignatureForOriginal = RazorpaySignatureUtils.calculateHmacSha256(originalPayload, secret);

        String tamperedPayload = "{\"event\":\"payment.captured\",\"amount\":500}"; // modified amount!

        boolean result = RazorpaySignatureUtils.verifySignature(tamperedPayload, validSignatureForOriginal, secret);
        assertFalse(result, "Tampered payload must be rejected when signature doesn't match");
    }

    @Test
    @DisplayName("Invalid signature header should be rejected")
    void testInvalidSignatureHeader() {
        String payload = "{\"event\":\"payment.captured\"}";
        String bogusSignature = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

        boolean result = RazorpaySignatureUtils.verifySignature(payload, bogusSignature, secret);
        assertFalse(result, "Invalid signature header must be rejected");
    }
}
