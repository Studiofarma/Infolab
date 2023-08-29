package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    //@Autowired
    // Tutorial: https://www.baeldung.com/spring-websockets-send-message-to-user
    //public SimpMessagingTemplate messagingTemplate;

    // Tutorial: https://www.baeldung.com/spring-jdbc-jdbctemplate#the-jdbctemplate-and-running-queries
    // Saltate pure la sezione 2 Configuration. Dopo avere letto come fare query di lettura e scrittura, vi
    // suggerisco di prestare attenzione alla sezione 5.1 SimpleJdbcInsert.
    // Come alternativa all'implementazione del RowMapper (sezione 3.3. Mapping Query Results to Java Object)
    // potete implementare il mappaggio utilizzando una lambda expression https://stackoverflow.com/questions/41923360/how-to-implement-rowmapper-using-java-lambda-expression
    //@Autowired
    //public JdbcTemplate jdbcTemplate;

    private final ChatService chatService;
    private final UserService userService;

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat general.
    @SubscribeMapping("/public")
    public void welcome(Authentication principal){

    }

    //region ROOM GENERAL
    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public WebSocketMessageDto register(@Payload WebSocketMessageDto message, SimpMessageHeaderAccessor headerAccessor, Principal principal){
        ChatMessageDto joinMessage = message.getJoin();
        if (joinMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has join field equals to null");
            return null;
        }

        headerAccessor.getSessionAttributes().put("username", principal.getName());

        Username username = Username.of(principal.getName());

        int rowsAffected = 0;
        boolean hasUserBeenCreated = false;

        try {
            userService.saveUserInDb(username, UserStatusEnum.ONLINE);
            hasUserBeenCreated = true;
        } catch (DuplicateKeyException e) {
            log.info("User username=\"%s\" already existing in database".formatted(joinMessage.getSender()));
            rowsAffected = userService.updateUserStatus(username, UserStatusEnum.ONLINE);
        }

        // This is needed for security
        message.getJoin().setSender(principal.getName());

        if (rowsAffected == 1 || hasUserBeenCreated) {
            return message;
        } else {
            return null;
        }
    }

    @MessageMapping("/chat.unregister")
    @SendTo("/topic/public")
    public WebSocketMessageDto unregister(@Payload WebSocketMessageDto message, Principal principal) {
        ChatMessageDto quitMessage = message.getQuit();
        if (quitMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has join field equals to null");
            return null;
        }

        int rowsAffected = userService.updateUserStatus(Username.of(principal.getName()), UserStatusEnum.OFFLINE);

        message.getQuit().setSender(principal.getName());

        if (rowsAffected == 1) {
            return message;
        } else {
            return null;
        }
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public WebSocketMessageDto sendMessage(@Payload WebSocketMessageDto message, SimpMessageHeaderAccessor headerAccessor, Principal principal){
        ChatMessageDto chatMessage = message.getChat();
        if (chatMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has chat field equals to null");
            return null;
        }

        ChatMessageEntity messageEntity =
                chatService.saveMessageInDb(chatMessage, Username.of(principal.getName()), RoomName.of("general"), null);
        return WebSocketMessageDto.ofChat(FromEntitiesToDtosMapper.fromEntityToChatMessageDto(messageEntity));
    }

    @MessageMapping("/chat.delete")
    @SendTo("/topic/public")
    public WebSocketMessageDto deleteMessage(@Payload WebSocketMessageDto message, Principal principal) {
        ChatMessageDto deleteMessage = message.getDelete();
        if (deleteMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has delete field equals to null");
            return null;
        }

        int rowsAffected = chatService.deleteMessageById(Username.of(principal.getName()), deleteMessage.getId());
        if (rowsAffected == 1) {
            return message;
        } else {
            return null;
        }
    }

    @MessageMapping("/chat.edit")
    @SendTo("/topic/public")
    public WebSocketMessageDto editMessage(@Payload WebSocketMessageDto message, Principal principal) {
        ChatMessageDto editMessage = message.getEdit();
        if (editMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has edit field equals to null");
            return null;
        }

        int rowsAffected = chatService.editMessageById(Username.of(principal.getName()), editMessage.getId(), editMessage.getContent());
        if (rowsAffected == 1) {
            return message;
        } else {
            return null;
        }
    }
    //endregion

    //region PRIVATE ROOMS
    @MessageMapping("/chat.send.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    public WebSocketMessageDto sendMessageToUser(
            @Payload WebSocketMessageDto message,
            @DestinationVariable String destinationUser,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal) {

        ChatMessageDto chatMessage = message.getChat();
        if (chatMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has chat field equals to null");
            return null;
        }

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        log.info(String.format("message from %s to %s", username, destinationUser));
        ChatMessageEntity messageEntity = chatService.saveMessageInDb(
                message.getChat(),
                Username.of(principal.getName()),
                RoomName.of(Username.of(principal.getName()), Username.of(destinationUser)),
                Username.of(destinationUser)
        );
        return WebSocketMessageDto.ofChat(FromEntitiesToDtosMapper.fromEntityToChatMessageDto(messageEntity));

    }

    @MessageMapping("/chat.delete.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    public WebSocketMessageDto deleteMessagePrivateRoom(
            @Payload WebSocketMessageDto message,
            @DestinationVariable String destinationUser,
            Principal principal) {
        ChatMessageDto deleteMessage = message.getDelete();
        if (deleteMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has delete field equals to null");
            return null;
        }

        int rowsAffected = chatService.deleteMessageById(Username.of(principal.getName()), message.getDelete().getId());
        if (rowsAffected == 1) {
            return message;
        } else {
            return null;
        }
    }

    @MessageMapping("/chat.edit.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    public WebSocketMessageDto editMessagePrivateRoom(
            @Payload WebSocketMessageDto message,
            @DestinationVariable String destinationUser,
            Principal principal) {
        ChatMessageDto editMessage = message.getEdit();
        if (editMessage == null) {
            log.warn("Received WebSocketMessageDto has been ignored because it has edit field equals to null");
            return null;
        }
        
        int rowsAffected = chatService.editMessageById(Username.of(principal.getName()), message.getEdit().getId(), message.getEdit().getContent());
        if (rowsAffected == 1) {
            return message;
        } else {
            return null;
        }
    }
    //endregion
}

