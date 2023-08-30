package com.cgm.infolab;

import com.cgm.infolab.helper.EncryptionHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class EncryptionHelperTests {

    @Autowired
    private EncryptionHelper encryptionHelper;

    @Test
    void givenString_whenEncrypt_thenSuccess()
            throws NoSuchAlgorithmException, IllegalBlockSizeException, InvalidKeyException,
            BadPaddingException, InvalidAlgorithmParameterException, NoSuchPaddingException, InvalidKeySpecException {

        String input = "banana";

        String cipherText = encryptionHelper.encryptWithAes(input);
        Assertions.assertNotEquals(input, cipherText);

        String plainText = encryptionHelper.decryptWithAes(cipherText);
        Assertions.assertEquals(input, plainText);
    }
}
