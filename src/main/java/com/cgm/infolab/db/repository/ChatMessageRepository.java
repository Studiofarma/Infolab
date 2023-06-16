package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
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
    private final DataSource dataSource;
    private final QueryHelper queryHelper;

    private final String SELECT_QUERY = "SELECT m.id message_id, u_mex.id user_id, u_mex.username username, m.sender_id, r.id room_id, r.roomname, r.visibility, m.sent_at, m.content";
    private final String JOIN_QUERY = "LEFT JOIN infolab.chatmessages m ON r.id = m.recipient_room_id LEFT JOIN infolab.users u_mex ON u_mex.id = m.sender_id";
    private final String WHERE_QUERY = "r.roomname = :roomName";
    private final String OTHER_ORDER_BY_QUERY = "ORDER BY m.sent_at DESC";
    private final String OTHER_ORDER_BY_LIMIT_QUERY = OTHER_ORDER_BY_QUERY + " LIMIT :limit";

    private final Logger log = LoggerFactory.getLogger(ChatMessageRepository.class);

    public ChatMessageRepository(DataSource dataSource, QueryHelper queryHelper) {
        this.dataSource = dataSource;
        this.queryHelper = queryHelper;
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
    public List<ChatMessageEntity> getByRoomName(RoomName roomName, Username username) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());

        return queryMessages(SELECT_QUERY, JOIN_QUERY, WHERE_QUERY, OTHER_ORDER_BY_QUERY, username, map);
    }

    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(RoomName roomName, int numberOfMessages, Username username) {
        // In caso il parametro non sia valido vengono ritornati tutti i messaggi disponibili.
        if (numberOfMessages < 0) {
            return getByRoomName(roomName, username);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());
        map.put("limit", numberOfMessages);

        return queryMessages(SELECT_QUERY, JOIN_QUERY, WHERE_QUERY, OTHER_ORDER_BY_LIMIT_QUERY, username, map);
    }

    private List<ChatMessageEntity> queryMessages(String select, String join, String where, String other, Username username, Map<String, ?> queryParams) {
        try {
            log.info(queryHelper.forUSer(username)
                    .query(select)
                    .join(join)
                    .where(where)
                    .other(other).query());
            return queryHelper.forUSer(username)
                    .query(select)
                    .join(join)
                    .where(where)
                    .other(other)
                    .executeForList(this::mapToEntity, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    public ChatMessageEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {

        String username = rs.getString("username");
        if (username == null) {
            throw new EmptyResultDataAccessException(
                    "This exception handles the case where there are no messages in a room." +
                        " When trying to get them null will be returned instead of empty response. This is the empty response that will be handled.",
                    0
            );
        }

        UserEntity user = UserEntity.of(rs.getLong("sender_id"),
                Username.of(username));

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
