package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.model.ChatMessage;
import com.cgm.infolab.db.model.RoomEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class ChatApiMessagesController {
    private final ChatMessageRepository chatMessageRepository;

    private final Logger log = LoggerFactory.getLogger(ChatApiMessagesController.class);

    public ChatApiMessagesController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages/general (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages/general")
    public List<ChatMessage> getAllMessagesGeneral() {
        RoomEntity room = RoomEntity.of("general");
        List<ChatMessageEntity> chatMessageEntities;
        List<ChatMessage> messages = new ArrayList<>();
        try {
            chatMessageEntities = chatMessageRepository.getByRoomName(room.getName());
        } catch (IllegalArgumentException e) {
            log.info(e.getMessage());
            return messages;
        }

        if (chatMessageEntities.size() > 0) {
            for (ChatMessageEntity entity : chatMessageEntities) {
                ChatMessage message = new ChatMessage(entity.getContent(), entity.getTimestamp(), entity.getSender().getName());
                messages.add(message);
            }
        } else {
            log.info("Non sono stati trovati messaggi nella room specificata");
        }

        return messages;
    }
}
