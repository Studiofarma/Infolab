package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.function.Supplier;

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
    public long add(ChatMessageEntity message) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", message.getSender().getId());
        parameters.put("recipient_room_id", message.getRoom().getId());
        parameters.put("sent_at", message.getTimestamp());
        parameters.put("content", message.getContent());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che ritorna tutti i messaggi mandati in una room.
     * @param roomName da cui prendere i messaggi
     * @return lista di messaggi trovati. Ritorna null se non è stato trovato nessun messaggio.
     */
    public List<ChatMessageEntity> getByRoomName(String roomName) {
        return queryMessages(
            "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?",
            roomName,
            (room) -> new Object[]{room.getId()}
        );
    }

    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(String roomName, int numberOfMessages) {
        // In caso il parametro non sia valido vengono ritornati tutti i messaggi disponibili.
        if (numberOfMessages < 0) {
            return getByRoomName(roomName);
        }

        return queryMessages(
            "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ? LIMIT ?",
            roomName,
            (room) -> new Object[]{room.getId(), numberOfMessages});
    }

    private List<ChatMessageEntity> queryMessages(String query, String roomName, Function<RoomEntity, Object[]> queryParamsBuilder) {
        RoomEntity room = getRoomByNameOrThrow(roomName);
        try {
            Object[] queryParams = queryParamsBuilder.apply(room);
            return jdbcTemplate.query(query, this::mapToEntity, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private ChatMessageEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {
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
        message.setTimestamp(rs.getTimestamp("sent_at").toInstant().atZone(ZoneId.of("Europe/Rome")).toLocalDateTime());
        message.setContent(rs.getString("content"));
        return message;
    }

    private RoomEntity getRoomByNameOrThrow(String roomName) {
        return roomRepository.getByRoomName(roomName).orElseThrow(() -> {
            throw new IllegalArgumentException(String.format("Room roomName=\"%s\" non trovata.", roomName));
        });
    }
}
