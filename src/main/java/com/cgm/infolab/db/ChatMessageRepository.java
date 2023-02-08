package com.cgm.infolab.db;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.*;

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
    public long add(ChatMessageEntity message) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", message.getSender().getId());
        parameters.put("recipient_room_id", message.getRoom().getId());
        parameters.put("sent_at", message.getTimestamp());
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
     * @param roomName da cui prendere i messaggi
     * @return lista di messaggi trovati. Ritorna null se non è stato trovato nessun messaggio.
     */
    public List<ChatMessageEntity> getByRoomName(String roomName) {

        RoomEntity room = roomRepository.getByRoomName(roomName).orElseThrow(() -> {
            throw new IllegalArgumentException(String.format("Room roomName=\"%s\" non trovata.", roomName));
        });

        String query = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?";

        try {
            return jdbcTemplate.query(query, (rs, rowNum) -> {
                        ChatMessageEntity message = ChatMessageEntity.emptyMessage();
                        message.setId(rs.getLong("id"));

                        long userId = Long.parseLong(rs.getString("sender_id"));
                        message.setSender(userRepository.getById(userId).orElseGet(() -> {
                            log.info(String.format("Utente userId=\"%d\" non trovato.", userId));
                            return null;
                        }));

                        long roomId = Long.parseLong(rs.getString("recipient_room_id"));
                        message.setRoom(roomRepository.getById(roomId).orElseGet(() -> {
                            log.info(String.format("Room roomId=\"%d\" non trovato.", roomId));
                            return null;
                        }));

                        //TODO: sistemare bug per cui la data viene presa come UTC e non con la timezone richiesta
                        message.setTimestamp(rs.getTimestamp("sent_at"));
                        message.setContent(rs.getString("content"));
                        return message;
            },
                    room.getId());
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }
}
