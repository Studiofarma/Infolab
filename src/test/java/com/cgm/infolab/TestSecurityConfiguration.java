package com.cgm.infolab;

import com.cgm.infolab.helper.TestJwtHelper;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@TestConfiguration
public class TestSecurityConfiguration {
    @Bean
    public JwtDecoder jwtDecoder() {
        return SecurityConfiguration.jwtDecoder(() -> NimbusJwtDecoder.withPublicKey(new TestJwtHelper().getPublicKey()).build());
    }
}
