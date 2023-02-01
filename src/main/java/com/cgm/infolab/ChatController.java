package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import com.cgm.infolab.model.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
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

import javax.sql.DataSource;
import javax.xml.crypto.Data;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatController {

    public ApplicationContext applicationContext;

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

    public DBSavingManager dbSavingManager;

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    public ChatController(SimpMessagingTemplate messagingTemplate,
                          ApplicationContext applicationContext,
                          DBSavingManager dbSavingManager) {
        this.messagingTemplate = messagingTemplate;
        this.applicationContext = applicationContext;
        this.dbSavingManager = dbSavingManager;
    }

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat.
    @SubscribeMapping("/public")
    public ChatMessage welcome(Authentication principal){

        dbSavingManager.addUser(principal.getName());

        return new ChatMessage("Chat Bot", String.format("welcome %s to topic/public", principal.getName()), MessageType.CHAT);
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

        dbSavingManager.addMessage(message);

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

