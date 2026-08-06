package com.novacart.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Embedded — present only when the user has ROLE_SELLER. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProfile {
    private String businessName;
    private String gstNumber;
    private boolean verified;
}
