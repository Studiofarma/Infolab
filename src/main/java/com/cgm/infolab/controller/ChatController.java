package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.cgm.infolab.model.WebSocketMessageTypeEnum;
import com.cgm.infolab.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat general.
    @SubscribeMapping("/public")
    public void welcome(Authentication principal){

    }

    //region ROOM GENERAL
    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public ChatMessageDto register(@Payload ChatMessageDto message, SimpMessageHeaderAccessor headerAccessor){
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessageDto sendMessage(@Payload ChatMessageDto message, SimpMessageHeaderAccessor headerAccessor, Principal principal){
        ChatMessageEntity messageEntity = chatService.saveMessageInDb(message, Username.of(principal.getName()), RoomName.of("general"), null);
        return FromEntitiesToDtosMapper.fromEntityToChatMessageDto(messageEntity);
    }

    @MessageMapping("/chat.delete")
    @SendTo("/topic/public")
    public WebSocketMessageDto deleteMessage(@Payload WebSocketMessageDto messageDto, Principal principal) {
        int rowsAffected = chatService.deleteMessageById(Username.of(principal.getName()), messageDto.getDelete().getId());
        if (rowsAffected == 1) {
            return messageDto;
        } else {
            return null;
        }
    }

    @MessageMapping("/chat.edit")
    @SendTo("/topic/public")
    public WebSocketMessageDto editMessage(@Payload WebSocketMessageDto messageDto, Principal principal) {
        int rowsAffected = chatService.editMessageById(Username.of(principal.getName()), messageDto.getEdit().getId(), messageDto.getEdit().getContent());
        if (rowsAffected == 1) {
            return messageDto;
        } else {
            return null;
        }
    }
    //endregion

    //region PRIVATE ROOMS
    @MessageMapping("/chat.send.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    public ChatMessageDto sendMessageToUser(
            @Payload ChatMessageDto message,
            @DestinationVariable String destinationUser,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal){
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        log.info(String.format("message from %s to %s", username, destinationUser));
        ChatMessageEntity messageEntity = chatService.saveMessageInDb(
                message, Username.of(principal.getName()),
                RoomName.of(Username.of(principal.getName()),
                Username.of(destinationUser)),
                Username.of(destinationUser)
        );
        return FromEntitiesToDtosMapper.fromEntityToChatMessageDto(messageEntity);
    }

    @MessageMapping("/chat.delete.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    public WebSocketMessageDto deleteMessagePrivateRoom(
            @Payload WebSocketMessageDto message,
            @DestinationVariable String destinationUser,
            Principal principal){
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
            Principal principal){
        int rowsAffected = chatService.editMessageById(Username.of(principal.getName()), message.getEdit().getId(), message.getEdit().getContent());
        if (rowsAffected == 1) {
            return message;
        } else {
            return null;
        }
    }
    //endregion
}

