package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
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
import java.sql.Timestamp;

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

    private final UserRepository userRepository;
    private final ChatService chatService;

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    public ChatController(UserRepository userRepository,
                          ChatService chatService) {
        this.userRepository = userRepository;
        this.chatService = chatService;
    }

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat general.
    @SubscribeMapping("/public")
    public void welcome(Authentication principal){

    }

    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public ChatMessageDto register(@Payload ChatMessageDto message, SimpMessageHeaderAccessor headerAccessor){
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessageDto sendMessage(@Payload ChatMessageDto message, SimpMessageHeaderAccessor headerAccessor, Principal principal){
        ChatMessageEntity messageEntity = chatService.saveMessageInDbPublicRooms(message, Username.of(principal.getName()), RoomName.of("general"));
        return new ChatMessageDto(messageEntity.getContent(), messageEntity.getTimestamp(), messageEntity.getSender().getName().value(), "general");
    }

    @MessageMapping("/chat.send.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    ChatMessageDto sendMessageToUser(
            @Payload ChatMessageDto message,
            @DestinationVariable String destinationUser,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal){
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        log.info(String.format("message from %s to %s", username, destinationUser));
        ChatMessageEntity messageEntity = chatService.saveMessageInDbPrivateRooms(message, Username.of(principal.getName()),
            RoomName.of(Username.of(principal.getName()), Username.of(destinationUser)));
        return new ChatMessageDto(messageEntity.getContent(), messageEntity.getTimestamp(), messageEntity.getSender().getName().value(), RoomName.getRoomNameByUsers(Username.of(principal.getName()), Username.of(destinationUser)));
    }
}

