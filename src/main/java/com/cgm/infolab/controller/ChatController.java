package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomSubscriptionEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RoomSubscriptionRepository;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    //@Autowired
    // Tutorial: https://www.baeldung.com/spring-websockets-send-message-to-user
    public SimpMessagingTemplate messagingTemplate;

    // Tutorial: https://www.baeldung.com/spring-jdbc-jdbctemplate#the-jdbctemplate-and-running-queries
    // Saltate pure la sezione 2 Configuration. Dopo avere letto come fare query di lettura e scrittura, vi
    // suggerisco di prestare attenzione alla sezione 5.1 SimpleJdbcInsert.
    // Come alternativa all'implementazione del RowMapper (sezione 3.3. Mapping Query Results to Java Object)
    // potete implementare il mappaggio utilizzando una lambda expression https://stackoverflow.com/questions/41923360/how-to-implement-rowmapper-using-java-lambda-expression
    //@Autowired
    //public JdbcTemplate jdbcTemplate;

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomSubscriptionRepository roomSubscriptionRepository;
    private final ChatService chatService;

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate,
                          UserRepository userRepository,
                          RoomRepository roomRepository, RoomSubscriptionRepository roomSubscriptionRepository,
                          ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomSubscriptionRepository = roomSubscriptionRepository;
        this.chatService = chatService;
    }

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat general.
    @SubscribeMapping("/public")
    public void welcome(Authentication principal){

        try {
            userRepository.add(UserEntity.of(principal.getName()));
        } catch (DuplicateKeyException e) {
            log.info(String.format("User username=\"%s\" già esistente nel database", principal.getName()));
        }

        RoomSubscriptionEntity roomSubscription = RoomSubscriptionEntity.empty();
        try {
            RoomEntity room = roomRepository.getByRoomNameEvenIfNotSubscribed("general").orElseGet(() -> {
                // Qui dentro non dovrebbe mai entrarci, dato che la room general viene aggiunta al lancio dell'app
                return null;
            });

            UserEntity user = userRepository.getByUsername(principal.getName()).orElseGet(() -> {
                // Qui dentro non dovrebbe mai entrarci, dato che l'utente se non c'era è stato aggiunto
                log.info(String.format("User username=\"%s\" non trovato.", principal.getName()));
                return null;
            });

            roomSubscription.setRoomId(room.getId());
            roomSubscription.setUserId(user.getId());

            roomSubscriptionRepository.add(roomSubscription);
        } catch (DuplicateKeyException e) {
            log.info("RoomSubscription " + roomSubscription + "già esistente nel database");
        }
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
        chatService.saveMessageInDb(message, principal.getName());
        return message;
    }

    @MessageMapping("/chat.send.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    ChatMessageDto sendMessageToUser(
            @Payload ChatMessageDto message,
            @DestinationVariable String destinationUser,
            SimpMessageHeaderAccessor headerAccessor){
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        log.info(String.format("message from %s to %s", username, destinationUser));
        return message;
    }
}

