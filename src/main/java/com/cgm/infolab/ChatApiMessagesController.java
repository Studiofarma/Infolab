package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChatApiMessagesController {

    private final DBManager dbManager;

    private final Logger logger = LoggerFactory.getLogger(ChatApiMessagesController.class);

    public ChatApiMessagesController(DBManager dbManager) {
        this.dbManager = dbManager;
    }

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages/general (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages/general")
    public List<ChatMessage> getAllMessagesGeneral() {
        List<ChatMessage> chatMessages = dbManager.getMessagesByRoom("general");

        if (chatMessages.size() == 0) logger.info("Non sono stati trovati messaggi nella stanza specificata");

        return chatMessages;
    }
}
