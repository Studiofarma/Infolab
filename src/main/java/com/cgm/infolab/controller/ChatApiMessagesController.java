package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
public class ChatApiMessagesController {
    private final ChatService chatService;

    public ChatApiMessagesController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages/general (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages/general")
    public List<ChatMessageDto> getAllMessagesGeneral(@RequestParam(required = false) Integer numberOfMessages, Principal principal) {
        if (numberOfMessages == null) {
            numberOfMessages = -1;
        }

        return chatService.getAllMessagesGeneral(numberOfMessages, principal.getName());
    }
}
