package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Component
public class ChatMessageRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    private final String MESSAGES_BY_ROOM_QUERY =
            "SELECT m.id message_id, u.id user_id, u.username, r.id room_id, r.roomname, r.visibility, m.sent_at, m.content " +
                    "FROM infolab.chatmessages m " +
                    "LEFT JOIN infolab.rooms r " +
                    "ON r.id = m.recipient_room_id " +
                    "LEFT JOIN infolab.users u " +
                    "ON u.id = m.sender_id " +
                    "WHERE EXISTS (SELECT s.room_id FROM infolab.rooms_subscriptions s " +
                        "RIGHT JOIN infolab.users u " +
                        "ON s.user_id = u.id " +
                        "WHERE (u.username = ? OR r.visibility = 'PUBLIC')) " +
                    "AND r.roomname = ? " +
                    "ORDER BY sent_at DESC ";

    private final Logger log = LoggerFactory.getLogger(ChatMessageRepository.class);

    public ChatMessageRepository(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
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
    public List<ChatMessageEntity> getByRoomName(String roomName, Username username) {
        return queryMessages(
                MESSAGES_BY_ROOM_QUERY,
                username.getValue(),
                roomName
        );
    }

    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(String roomName, int numberOfMessages, Username username) {
        // In caso il parametro non sia valido vengono ritornati tutti i messaggi disponibili.
        if (numberOfMessages < 0) {
            return getByRoomName(roomName, username);
        }

        return queryMessages(
            String.format("%s LIMIT ?", MESSAGES_BY_ROOM_QUERY),
                username.getValue(),
                roomName,
                numberOfMessages
        );
    }

    private List<ChatMessageEntity> queryMessages(String query, Object... queryParams) {
        try {
            return jdbcTemplate.query(query, this::mapToEntity, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    public ChatMessageEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {

        UserEntity user = UserEntity.of(rs.getLong("user_id"),
                Username.of(rs.getString("username")));

        RoomEntity room = RoomEntity.of(
                rs.getLong("room_id"),
                RoomName.of(rs.getString("roomname")),
                VisibilityEnum.valueOf(rs.getString("visibility").trim())
        );

        return ChatMessageEntity
                .of(rs.getLong("message_id"),
                        user,
                        room,
                        resultSetToLocalDateTime(rs),
                        rs.getString("content"));
    }

    private static LocalDateTime resultSetToLocalDateTime(ResultSet rs) throws SQLException {
        return rs
            .getTimestamp("sent_at")
            .toInstant()
            .atZone(ZoneId.of("Europe/Rome"))
            .toLocalDateTime();
    }
}
