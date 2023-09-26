package com.cgm.infolab.templates;

import com.cgm.infolab.helper.EncryptionHelper;
import com.cgm.infolab.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * When using this class override the setup method and add @BeforeAll annotation
 */
public class RepositoryWithMessagesTestTemplate extends RepositoryTestTemplate {
    @Autowired
    public ChatService chatService;
    @Autowired
    public EncryptionHelper encryptionHelper;
}
