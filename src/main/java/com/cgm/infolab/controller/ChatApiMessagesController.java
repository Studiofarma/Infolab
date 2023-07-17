package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
public class ChatApiMessagesController {
    private final ChatService chatService;
    private final Logger log = LoggerFactory.getLogger(ChatApiMessagesController.class);

    public ChatApiMessagesController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages/general (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages/{roomName}")
    public List<ChatMessageDto> getAllMessages(@PathVariable("roomName") String roomName,
                                               @RequestParam(required = false, name = "page[size]") Integer pageSize,
                                               @RequestParam(required = false, name = "page[after]") String pageAfter,
                                               @RequestParam(required = false, name = "page[before]") String pageBefore,
                                               Principal principal) {
        if (pageSize == null) {
            pageSize = -1;
        }

        List<ChatMessageDto> chatMessageDtos = new ArrayList<>();
        List<ChatMessageEntity> chatMessageEntities;
        if (pageAfter == null && pageBefore == null) {
            chatMessageEntities =
                    chatService.getAllMessages(pageSize, Username.of(principal.getName()), roomName, CursorEnum.NONE, null);
        } else if (pageBefore != null) {
            chatMessageEntities =
                    chatService.getAllMessages(pageSize, Username.of(principal.getName()), roomName, CursorEnum.PAGE_BEFORE, pageBefore);
        } else { // pageAfter != null
            chatMessageEntities =
                    chatService.getAllMessages(pageSize, Username.of(principal.getName()), roomName, CursorEnum.PAGE_AFTER, pageAfter);
        }

        if (chatMessageEntities.size() > 0) {
            chatMessageDtos = chatMessageEntities.stream().map(FromEntitiesToDtosMapper::fromEntityToChatMessageDto).toList();
            chatService.updateReadTimestamp(
                    Username.of(principal.getName()),
                    RoomName.of(roomName)
            );
        } else {
            log.info("Non sono stati trovati messaggi nella room specificata");
        }

        return chatMessageDtos;
    }
}
