package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;

@Component
public class ChatMessageRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    private final String MESSAGES_BY_ROOM_QUERY = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ? ORDER BY sent_at DESC";

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
    public List<ChatMessageEntity> getByRoomName(String roomName, String username) {
        return queryMessages(
            MESSAGES_BY_ROOM_QUERY,
            roomName,
            (room) -> new Object[]{room.getId()},
            username
        );
    }

    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(String roomName, int numberOfMessages, String username) {
        // In caso il parametro non sia valido vengono ritornati tutti i messaggi disponibili.
        if (numberOfMessages < 0) {
            return getByRoomName(roomName, username);
        }

        return queryMessages(
            String.format("%s LIMIT ?", MESSAGES_BY_ROOM_QUERY),
            roomName,
            (room) -> new Object[]{room.getId(), numberOfMessages},
            username
        );
    }

    private List<ChatMessageEntity> queryMessages(String query,
                                                  String roomName,
                                                  Function<RoomEntity, Object[]> queryParamsBuilder,
                                                  String username) {
        // TODO: gestire (o rilanciare e gestire in un altro posto) l'eccezione lanciata dal metodo.
        RoomEntity room = getRoomByNameOrThrow(roomName, username);
        try {
            Object[] queryParams = queryParamsBuilder.apply(room);
            return jdbcTemplate.query(query, this::mapToEntity, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    public ChatMessageEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {
        ChatMessageEntity message = ChatMessageEntity.empty();
        message.setId(rs.getLong("id"));

        long userId = Long.parseLong(rs.getString("sender_id"));
        message.setSender(userRepository.getById(userId).orElseGet(() -> {
            log.info(String.format("Utente userId=\"%d\" non trovato.", userId));
            return null;
        }));

        // TODO: considerare di spostarlo in un Bean
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        long roomId = Long.parseLong(rs.getString("recipient_room_id"));
        message.setRoom(roomRepository.getById(roomId, username).orElseGet(() -> {
            log.info(String.format("Room roomId=\"%d\" non trovato.", roomId));
            return null;
        }));

        message.setTimestamp(resultSetToLocalDateTime(rs));
        message.setContent(rs.getString("content"));
        return message;
    }

    private RoomEntity getRoomByNameOrThrow(String roomName, String username) {
        return roomRepository.getByRoomName(roomName, username).orElseThrow(() -> {
            throw new IllegalArgumentException(String.format("Room roomName=\"%s\" non trovata.", roomName));
        });
    }

    private static LocalDateTime resultSetToLocalDateTime(ResultSet rs) throws SQLException {
        return rs
            .getTimestamp("sent_at")
            .toInstant()
            .atZone(ZoneId.of("Europe/Rome"))
            .toLocalDateTime();
    }
}
