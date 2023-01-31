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
    public JdbcTemplate jdbcTemplate;

    private final Logger log = LoggerFactory.getLogger(ChatController.class);

    public ChatController(SimpMessagingTemplate messagingTemplate, JdbcTemplate jdbcTemplate, ApplicationContext applicationContext) {
        this.messagingTemplate = messagingTemplate;
        this.jdbcTemplate = jdbcTemplate;
        this.applicationContext = applicationContext;
    }

    //@Value("${DB_HOSTNAME}")
    private String DB_HOSTNAME = "localhost";

    //@Value("${DB_PORT}")
    private String DB_PORT = "5432";

    //@Value("${DB_USER}")
    private String DB_USER = "user";

    //@Value("${DB_PASSWORD}")
    private String DB_PASSWORD = "password";

    //@Bean
    public DataSource dataSource() {
        //return DataSourceBuilder.create().build();

        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(String.format("jdbc:postgresql://%s:%s/infolab-pg", DB_HOSTNAME, DB_PORT));
        dataSource.setUsername(DB_USER);
        dataSource.setPassword(DB_PASSWORD);

        return dataSource;

        /*return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .addScript("http://www.liquibase.org/xml/ns/dbchangelog")
                .addScript("classpath:jdbc/test-data.sql").build();*/
    }
    /*public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }*/

    // Questo metodo in teoria viene chiamato quando un utente entra nella chat.
    @SubscribeMapping("/public")
    public ChatMessage welcome(Authentication principal){

        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource())
                .withSchemaName("infolab")
                .withTableName("users")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("id", null);
        parameters.put("username", principal.getName());

        simpleJdbcInsert.executeAndReturnKey(parameters);

        /*int rows = addUser(principal.getName());
        if (rows > 0) log.info("Oh my god something has been saved to the database.");
        else log.info("Database saving failed :(");*/

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

        //jdbcTemplate.update(
        //        "INSERT INTO chatmessages VALUES (? ? ? ?)", 1, 1, 1, 1, message.getContent());

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


    private int addUser(String username) {
        return jdbcTemplate.update(
                "INSERT INTO users (username) VALUES (?)", username);
    }
}

