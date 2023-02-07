package com.cgm.infolab.db;

import com.cgm.infolab.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ChatMessageRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    private final Logger log = LoggerFactory.getLogger(ChatMessageRepository.class);

    public ChatMessageRepository(JdbcTemplate jdbcTemplate, DataSource dataSource,
                                 UserRepository userRepository, RoomRepository roomRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Metodo che aggiunge un messaggio al database.
     * @param message messaggio da salvare.
     * @return chiave che è stata auto generata per il messaggio creato, oppure -1 se il messaggio inserito esisteva già.
     */
    public long add(ChatMessage message) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", userRepository.readId(message.getUserSender()));
        // TODO: trovare un modo per prendere la room in cui il messaggio arriva.
        parameters.put("recipient_room_id", roomRepository.readId(new RoomEntity("general")));
        // TODO: rimuovere il timestamp quando arriverà dal frontend
        parameters.put("sent_at", new Timestamp(System.currentTimeMillis()));
        parameters.put("content", message.getContent());

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Message %s already exists in the database.", message));
        }
        return -1;
    }

    /**
     * Metodo che ritorna tutti i messaggi mandati in una room.
     * @param room da cui prendere i messaggi
     * @return lista di messaggi trovati. Ritorna null se non è stato trovato nessun messaggio.
     */
    public List<ChatMessage> getByRoomName(RoomEntity room) {
        long roomId = roomRepository.readId(room);

        String query = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?";

        try {
            return jdbcTemplate.query(query, new Object[]{roomId}, (rs, rowNum) -> {
                ChatMessage chatMessage = new ChatMessage();
                // Questa linea è commentata perché così se serve si può utilizzare (imposta sender invece di userSender)
                //chatMessage.setSender(userRepository.read(Long.parseLong(rs.getString("sender_id"))).getName());
                chatMessage.setUserSender(userRepository.getById(Long.parseLong(rs.getString("sender_id"))));
                chatMessage.setContent(rs.getString("content"));
                return chatMessage;
            });
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("Non sono stati trovati messaggi nella room %s", room.getName()));
        }

        return null;
    }
}
