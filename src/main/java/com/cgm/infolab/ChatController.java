package com.cgm.infolab;

import com.cgm.infolab.db.ChatMessageRepository;
import com.cgm.infolab.db.UserRepository;
import com.cgm.infolab.model.ChatMessage;
import com.cgm.infolab.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private final ChatMessageRepository chatMessageRepository;

    private final UserRepository userRepository;

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    public ChatController(SimpMessagingTemplate messagingTemplate,
                          ChatMessageRepository chatMessageRepository,
                          UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat.
    @SubscribeMapping("/public")
    public ChatMessage welcome(Authentication principal){

        userRepository.add(new User(principal.getName()));

        return new ChatMessage("Chat Bot", String.format("welcome %s to topic/public", principal.getName()));
    }

    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public ChatMessage register(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor){
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor){
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        message.setUserSender(new User(message.getSender()));
        chatMessageRepository.add(message);

        log.info(String.format("message from %s", username));
        return message;
    }

    @MessageMapping("/chat.send.{destinationUser}")
    @SendTo("/queue/{destinationUser}")
    @SendToUser("/topic/me")
    ChatMessage sendMessageToUser(
            @Payload ChatMessage message,
            @DestinationVariable String destinationUser,
            SimpMessageHeaderAccessor headerAccessor){
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        log.info(String.format("message from %s to %s", username, destinationUser));
        return message;
    }
}

