package com.cgm.infolab.helper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

@Component
public class EncryptionHelper {
    private String password;
    private String salt;
    private byte[] iv;

    private final SecretKeySpec key;
    private final IvParameterSpec ivParameterSpec;

    private final String ALGORITHM = "AES/CBC/PKCS5Padding";

    public EncryptionHelper(@Value("${encryption.key.password}") String password, @Value("${encryption.key.salt}") String salt, @Value("${encryption.key.iv}") byte[] iv) throws NoSuchAlgorithmException, InvalidKeySpecException {
        this.password = password;
        this.salt = salt;
        this.iv = iv;
        key = getKeyFromPassword(this.password, this.salt);
        ivParameterSpec = generateIv();
    }

    private SecretKeySpec getKeyFromPassword(String password, String salt) throws NoSuchAlgorithmException, InvalidKeySpecException {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(), 65536, 256);

            SecretKeySpec secretKeySpec = new SecretKeySpec(factory.generateSecret(spec).getEncoded(), "AES");
            return secretKeySpec;
    }

    private IvParameterSpec generateIv() {
        return new IvParameterSpec(iv);
    }

    private String encrypt(String algorithm, String input, SecretKey key, IvParameterSpec iv)
            throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException,
            InvalidKeyException, IllegalBlockSizeException, BadPaddingException {

        Cipher cipher = Cipher.getInstance(algorithm);
        cipher.init(Cipher.ENCRYPT_MODE, key, iv);
        byte[] cipherText = cipher.doFinal(input.getBytes());

        return Base64.getEncoder().encodeToString(cipherText);
    }

    private String decrypt(String algorithm, String cipherText, SecretKey key, IvParameterSpec iv)
            throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {

        Cipher cipher = Cipher.getInstance(algorithm);
        cipher.init(Cipher.DECRYPT_MODE, key, iv);
        byte[] plainText = cipher.doFinal(Base64.getDecoder().decode(cipherText));

        return new String(plainText);
    }

    public String encryptWithAes(String textToEncrypt)
            throws NoSuchAlgorithmException, InvalidKeySpecException, InvalidAlgorithmParameterException,
            NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeyException {

        return encrypt(ALGORITHM, textToEncrypt, key, ivParameterSpec);
    }

    public String decryptWithAes(String textToDecrypt)
            throws NoSuchAlgorithmException, InvalidKeySpecException, InvalidAlgorithmParameterException,
            NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeyException {

        return decrypt(ALGORITHM, textToDecrypt, key, ivParameterSpec);
    }
}
