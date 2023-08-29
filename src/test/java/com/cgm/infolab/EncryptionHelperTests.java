package com.cgm.infolab;

import com.cgm.infolab.helper.EncryptionHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
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
    @Value("${encryption.key.password}")
    private String password;
    @Value("${encryption.key.salt}")
    private String salt;

    @Test
    void givenString_whenEncrypt_thenSuccess()
            throws NoSuchAlgorithmException, IllegalBlockSizeException, InvalidKeyException,
            BadPaddingException, InvalidAlgorithmParameterException, NoSuchPaddingException, InvalidKeySpecException {

        String input = "banana";

        SecretKey key = encryptionHelper.getKeyFromPassword(password, salt);
        IvParameterSpec ivParameterSpec = encryptionHelper.generateIv();
        String algorithm = "AES/CBC/PKCS5Padding";
        String cipherText = encryptionHelper.encrypt(algorithm, input, key, ivParameterSpec);
        String plainText = encryptionHelper.decrypt(algorithm, cipherText, key, ivParameterSpec);
        Assertions.assertEquals(input, plainText);
    }

    @Test
    void whenGeneratingEncryptionKeyMultipleTimes_itIsAlwaysTheSame() throws NoSuchAlgorithmException, InvalidKeySpecException {
        SecretKey key1 = encryptionHelper.getKeyFromPassword(password, salt);
        SecretKey key2 = encryptionHelper.getKeyFromPassword(password, salt);
        SecretKey key3 = encryptionHelper.getKeyFromPassword(password, salt);
        SecretKey key4 = encryptionHelper.getKeyFromPassword(password, salt);

        Assertions.assertEquals(key1, key2);
        Assertions.assertEquals(key2, key3);
        Assertions.assertEquals(key3, key4);
    }

    @Test
    void whenEncryptingText_canBeDecryptedIfEverythingIsInitializedAgain() throws NoSuchAlgorithmException, InvalidKeySpecException, InvalidAlgorithmParameterException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeyException {
        String input = "banana";
        String algorithm = "AES/CBC/PKCS5Padding";

        SecretKey key1 = encryptionHelper.getKeyFromPassword(password, salt);
        IvParameterSpec ivParameterSpec1 = encryptionHelper.generateIv();
        String cipherText = encryptionHelper.encrypt(algorithm, input, key1, ivParameterSpec1);

        SecretKey key2 = encryptionHelper.getKeyFromPassword(password, salt);
        IvParameterSpec ivParameterSpec2 = encryptionHelper.generateIv();
        String plainText = encryptionHelper.decrypt(algorithm, cipherText, key2, ivParameterSpec2);

        Assertions.assertEquals(input, plainText);
    }
}
