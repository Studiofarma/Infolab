package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChatApiMessagesController {

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages")
    public List<ChatMessage> getAllMessages() {
        ChatMessage message = new ChatMessage();
        message.setContent("ciao");
        message.setSender("luca");
        ChatMessage message2 = new ChatMessage();
        message2.setContent("ciao2");
        message2.setSender("luca2");
        return List.of(message, message2);
    }

}
