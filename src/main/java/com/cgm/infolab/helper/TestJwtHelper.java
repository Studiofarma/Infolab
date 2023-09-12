package com.cgm.infolab.helper;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.time.Instant;

public class TestJwtHelper {
    private final String keyId = "Default-key";
    private final String privateJwkStr =
            "           { " +
            "                \"keys\": [ " +
            "                    { " +
            "                        \"p\": \"8bP5JdaeDTY7LsCL-utq6pkD7pr5hzdcpExOCw-NKqef573Fe1u1aIOSU1J9Z1tkg5t-3ZfIcWDJ28pF1KN2aTf7GficQZYbxxEP2Ub7UEyRByl_TANe0HNkPHVBVaM3WBtqSsqMUPPQ7ZMYceJUlkpq9CAYWB1Xa0risgX3ZEc\", " +
            "                        \"kty\": \"RSA\", " +
            "                        \"q\": \"zxHPwkXrgbkQPtpCgdm_vOOs0MiRrP72-ng1HrHuHz-1YZR9UA0Jb2phGYoAv2tYH4FeZqmV2CEbZ3A6Kz_gy5RYqnS41aDGwRLJ4pGSmOOdecRKYSwHA_Wy_7NF-anIEq_UTfpqvueX48VqU7h9_kJSYO65-ClxuJuMN8xMxYk\", " +
            "                        \"d\": \"jo4CduYY7MWP1TUF3_mfOl61u3s5saX9JHBi0rqMsQHGMkZliiOPHv_SOrB9qnoX8nbsenvSci0VLTPvo0BnL3GjdTKKsL-XuEmIuEGQyfjL0k5UyQyORUmcskmb2eBozC5PDvbSUcJK0mXDJrBuaYQqkb4X-jtECNkRKMgHqAjDX5LOpgc9jDEkZGzQ6SHsjBYN0SnkbJGgLOixQrir4kty53QeZ9edWktvIwRp57kmDZWJnLkEkrPi0sl1aqRAvpgEPozNogTDGMSov8EsIMRmCAL9VbYtI4QsTORW7G6lw9277oA2SihmQCaFTfG4TliBNOqzlULrIPmTBgxhEQ\", " +
            "                        \"e\": \"AQAB\", " +
            "                        \"use\": \"sig\", " +
            "                        \"kid\": \"" + keyId + "\", " +
            "                        \"qi\": \"ZweSPp4lN7jrHtr9S_4hHB7FKstb1ilOPtTHotlGoykUFkfQDvmEVfSvxX5VA3gh3EgjvavBtc7YQ8xHnu0OFM7AdDuhrfF7Em-X9FQjahfYh6OVwc-Xs9rd-BL-7cG29NbLJluGzKfOEaIQH9vjflnUXtY2bUSd2s85-pTUO9U\", " +
            "                        \"dp\": \"GUNYbU4LYxIiCXbyqp1kpXSs5omoPyvYMQwQtDNB7A1tN0mslII3ad8msjLTDLSOwvrDveGZf9BACQsRVXJodAL36fUEUA6ihKIR6AH1TqVSG0-JEKbhiCQne_I9i_ftVvY2m-6jz-pMEijnyy9-696HY1DfeoZGlt5S54ycGQ0\", " +
            "                        \"alg\": \"RS256\", " +
            "                        \"dq\": \"d2nMKDruP5cb2UNBC2Upf6LErHqeF-fJQlREPflaW0cAMM_THHEIOepdKL8_AyTCYxjV-dpegY9GIHbF9N8Xog9gupwpY3keZYWSS0isA-NvkyMxyav8N7pfibo25m2U5cHkazu4h3NDUqUsVi-U6SYSH7hMIuKzpER_rkXxGBE\", " +
            "                        \"n\": \"w4FXkRbpUTt-b-od3aiDon8q4niuMkI30sXVffKSbcJFauo47W7MC19xg7KUvWePe3sH7kJFumMil6Tpi0TV9kPj27YBzpDvAxDMx5M8JElsYrB9hj18NuCnzjD29bXcfE0uXKJpsuSiN4Nx452mQeq7lXudHA0VXr8OTBwCYQE9rOFtZpaH7hJRtTv7qeXnoLRAKgMi-buRbmmJHq3FnXc_BONr1_LJebzwwBOHUUQ8KfBWxriDWhg_vqEQkLSdY7OgYHWi1e8h4DBgg8yVQhPD5nWanEdAJUbekI5mzninpeW_ggSivtq6Y1z0ArEOjYar2yFdnvCHG5h36qNM_w\" " +
            "                    } " +
            "                ] " +
            "            }";

    private final String publicJwkStr =
                    "           { " +
                    "                \"keys\": [ " +
                    "                    { " +
                    "                        \"kty\": \"RSA\", " +
                    "                        \"e\": \"AQAB\", " +
                    "                        \"use\": \"sig\", " +
                    "                        \"kid\": \"" + keyId + "\", " +
                    "                        \"alg\": \"RS256\", " +
                    "                        \"n\": \"w4FXkRbpUTt-b-od3aiDon8q4niuMkI30sXVffKSbcJFauo47W7MC19xg7KUvWePe3sH7kJFumMil6Tpi0TV9kPj27YBzpDvAxDMx5M8JElsYrB9hj18NuCnzjD29bXcfE0uXKJpsuSiN4Nx452mQeq7lXudHA0VXr8OTBwCYQE9rOFtZpaH7hJRtTv7qeXnoLRAKgMi-buRbmmJHq3FnXc_BONr1_LJebzwwBOHUUQ8KfBWxriDWhg_vqEQkLSdY7OgYHWi1e8h4DBgg8yVQhPD5nWanEdAJUbekI5mzninpeW_ggSivtq6Y1z0ArEOjYar2yFdnvCHG5h36qNM_w\" " +
                    "                    } " +
                    "                ] " +
                    "            }";

    private final JWKSet publicJwkSet;
    private final JWKSet privateJwkSet;
    private final RSAPublicKey publicKey;

    public TestJwtHelper() {
        try {
            this.publicJwkSet = JWKSet.parse(this.publicJwkStr);
            this.privateJwkSet = JWKSet.parse(this.privateJwkStr);
            this.publicKey = this.publicJwkSet
                    .getKeyByKeyId(keyId)
                    .toRSAKey()
                    .toRSAPublicKey();
        } catch (ParseException | JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public Jwt generateToken(String scope, String username) {
        NimbusJwtEncoder tokenEncoder = new NimbusJwtEncoder((jwkSelector, securityContext) -> jwkSelector.select(privateJwkSet));
        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .expiresAt(Instant.now().plusMillis(0))
                .claim("scope", scope)
                .claim("user_name", username)
                .build();

        JwtEncoderParameters encoderParameters = JwtEncoderParameters.from(claimsSet);

        return tokenEncoder.encode(encoderParameters);
    }

    public RSAPublicKey getPublicKey() {
        return publicKey;
    }
}
