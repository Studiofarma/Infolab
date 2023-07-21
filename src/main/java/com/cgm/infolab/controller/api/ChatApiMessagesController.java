package com.cgm.infolab.controller.api;

import com.cgm.infolab.controller.FromEntitiesToDtosMapper;
import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import static com.cgm.infolab.controller.api.ApiConstants.*;

@RestController
@Validated
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
                                               @RequestParam(required = false, name = PAGE_SIZE_API_NAME) @Min(1) @Max(30) Integer pageSize,
                                               @RequestParam(required = false, name = PAGE_BEFORE_API_NAME) String pageBefore,
                                               @RequestParam(required = false, name = PAGE_AFTER_API_NAME) String pageAfter,
                                               Principal principal) {
        if (pageBefore != null && pageAfter != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Range Pagination Not Supported");
        }

        if (pageSize == null) {
            pageSize = -1;
        }

        List<ChatMessageDto> chatMessageDtos = new ArrayList<>();
        List<ChatMessageEntity> chatMessageEntities = chatService.getAllMessages(
                pageSize,
                Username.of(principal.getName()),
                RoomName.of(roomName),
                pageBefore,
                pageAfter
        );

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

    @DeleteMapping("/api/messages/{roomName}/{id}")
    public void deleteMessageById(@PathVariable("id") Long id,
                                  Principal principal) {
        chatService.deleteMessageById(Username.of(principal.getName()), id);
    }

    @PutMapping("/api/messages/{roomName}/{id}")
    public void editMessageById(@PathVariable("id") Long id,
                                @RequestBody String newContent,
                                Principal principal) {
        chatService.editMessageById(Username.of(principal.getName()), id, newContent);
    }
}
