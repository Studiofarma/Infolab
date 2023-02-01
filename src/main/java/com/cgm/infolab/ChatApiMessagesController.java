package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import com.cgm.infolab.model.MessageType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChatApiMessagesController {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<ChatMessage> messageRowMapper;

    public ChatApiMessagesController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.messageRowMapper = (rs, rowNum) -> {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSender(rs.getString("sender_id"));
            chatMessage.setContent(rs.getString("content"));
            chatMessage.setType(MessageType.CHAT);
            return chatMessage;
        };
    }

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages/general (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages/general")
    public List<ChatMessage> getAllMessagesGeneral() {
        long roomId = 1;

        String query = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?";

        return jdbcTemplate.query(query, new Object[]{roomId}, messageRowMapper);
    }
}
