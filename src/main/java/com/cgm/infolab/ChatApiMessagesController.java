package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import com.cgm.infolab.model.MessageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ChatApiMessagesController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Tutorial: https://www.baeldung.com/spring-controller-vs-restcontroller
    // Tutorial: https://www.lateralecloud.it/spring-boot-rest-controller/
    // Specifiche sui comandi HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    // Esempi di messaggi HTTP https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // Potete provare le chiamate all'API aprendo un browser all'indirizzo http://localhost:8081/api/messages (vi chiedera' username e password. user1 - password1)
    // Se volete provare uno strumento piu' avanzato per le chiamate all'API usate Postman https://www.postman.com/downloads/
    @GetMapping("/api/messages")
    public List<ChatMessage> getAllMessages() {
        /*String query = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?";
        ChatMessage chatMessage = jdbcTemplate.queryForObject(
                query, new Object[] {1}, new MessageRowMapper());*/

        //return List.of(chatMessage);

        long roomId = 1;

        String query = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?";
        List<ChatMessage> chatMessages = jdbcTemplate.query(query, new Object[]{roomId}, new MessageRowMapper());

        return chatMessages;

        /*List<Map<String, Object>> messages = jdbcTemplate
                .queryForList("SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?", roomId);*/
    }

    private class MessageRowMapper implements RowMapper<ChatMessage> {
        @Override
        public ChatMessage mapRow(ResultSet rs, int rowNum) throws SQLException {
            ChatMessage chatMessage = new ChatMessage();

            chatMessage.setSender(rs.getString("sender_id"));
            chatMessage.setContent(rs.getString("content"));
            chatMessage.setType(MessageType.CHAT);

            return chatMessage;
        }
    }

}
