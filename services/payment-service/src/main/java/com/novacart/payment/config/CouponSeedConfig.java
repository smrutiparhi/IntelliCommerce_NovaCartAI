package com.novacart.payment.config;

import com.novacart.payment.entity.Coupon;
import com.novacart.payment.entity.DiscountType;
import com.novacart.payment.repository.CouponRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class CouponSeedConfig {

    @Bean
    @Profile("!test")
    CommandLineRunner seedCoupons(CouponRepository coupons) {
        return args -> {
            if (coupons.findByCodeAndIsActiveTrue("NOVA10").isEmpty()) {
                coupons.save(Coupon.builder()
                    .code("NOVA10")
                    .type(DiscountType.PERCENT)
                    .value(10L)
                    .minOrderValuePaise(99900L)
                    .maxDiscountPaise(200000L)
                    .isActive(true)
                    .build());
            }
        };
    }
}
