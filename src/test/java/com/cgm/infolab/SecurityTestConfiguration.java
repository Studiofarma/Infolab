package com.cgm.infolab;

import com.cgm.infolab.helper.TestJwtHelper;
import com.nimbusds.jose.JOSEException;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.text.ParseException;

@TestConfiguration
public class SecurityTestConfiguration {
    @Bean
    public JwtDecoder jwtDecoder() {
        return SecurityConfiguration.jwtDecoder(() -> {
            try {
                return NimbusJwtDecoder.withPublicKey(new TestJwtHelper().getPublicKey()).build();
            } catch (ParseException | JOSEException e) {
                throw new RuntimeException(e);
            }
        });
    }
}
