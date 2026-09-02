package com.novacart.payment.service;

import com.novacart.payment.dto.ApplyCouponRequest;
import com.novacart.payment.entity.Coupon;
import com.novacart.payment.entity.DiscountType;
import com.novacart.payment.repository.CouponRepository;
import com.novacart.payment.repository.PaymentOutboxRepository;
import com.novacart.payment.repository.PaymentRepository;
import com.novacart.payment.repository.RefundRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceCouponTest {

    @Mock PaymentRepository payments;
    @Mock RefundRepository refunds;
    @Mock CouponRepository coupons;
    @Mock PaymentOutboxRepository outbox;
    @InjectMocks PaymentService service;

    @Test
    void normalizesCodeAndCapsPercentageDiscount() {
        Coupon coupon = Coupon.builder().code("NOVA10").type(DiscountType.PERCENT).value(10L)
            .minOrderValuePaise(99900L).maxDiscountPaise(200000L).isActive(true).build();
        when(coupons.findByCodeAndIsActiveTrue("NOVA10")).thenReturn(Optional.of(coupon));

        assertThat(service.calculateDiscount(new ApplyCouponRequest(" nova10 ", 3000000L))).isEqualTo(200000L);
    }

    @Test
    void rejectsExpiredCoupon() {
        Coupon coupon = Coupon.builder().code("OLD10").type(DiscountType.PERCENT).value(10L)
            .validTo(Instant.now().minusSeconds(1)).isActive(true).build();
        when(coupons.findByCodeAndIsActiveTrue("OLD10")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> service.calculateDiscount(new ApplyCouponRequest("OLD10", 100000L)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("no longer available");
    }
}
