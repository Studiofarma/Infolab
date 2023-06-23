package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import com.cgm.infolab.db.repository.queryhelper.UserQueryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.*;

@Component
public class ChatMessageRepository {
    private final DataSource dataSource;
    private final QueryHelper queryHelper;

    private final Logger log = LoggerFactory.getLogger(ChatMessageRepository.class);

    public ChatMessageRepository(DataSource dataSource, QueryHelper queryHelper) {
        this.dataSource = dataSource;
        this.queryHelper = queryHelper;
    }

    public ChatMessageEntity add(ChatMessageEntity message) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", message.getSender().getId());
        parameters.put("recipient_room_id", message.getRoom().getId());
        parameters.put("sent_at", message.getTimestamp());
        parameters.put("content", message.getContent());

        return ChatMessageEntity.of((long)simpleJdbcInsert.executeAndReturnKey(parameters),
                message.getSender(),
                message.getRoom(),
                message.getTimestamp(),
                message.getContent());
    }

    public List<ChatMessageEntity> getByRoomName(RoomName roomName, Username username) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());

        return queryUserMessages("ORDER BY m.sent_at DESC", username, map);
    }

    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(RoomName roomName, int numberOfMessages, Username username) {
        // In caso il parametro non sia valido vengono ritornati tutti i messaggi disponibili.
        if (numberOfMessages < 0) {
            return getByRoomName(roomName, username);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());
        map.put("limit", numberOfMessages);

        return queryUserMessages("ORDER BY m.sent_at DESC LIMIT :limit", username, map);
    }

    private List<ChatMessageEntity> queryUserMessages(String other, Username username, Map<String, ?> queryParams) {
        try {
            return getMessagges(username)
                    .other(other)
                    .executeForList(RowMappers::mapToChatMessageEntity, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private UserQueryResult getMessagges(Username username) {
        return queryHelper
                .forUser(username)
                .query("SELECT m.id message_id, u_mex.id user_id, u_mex.username username, m.sender_id, r.id room_id, r.roomname, r.visibility, m.sent_at, m.content")
                .join("LEFT JOIN infolab.chatmessages m ON r.id = m.recipient_room_id LEFT JOIN infolab.users u_mex ON u_mex.id = m.sender_id")
                .where("r.roomname = :roomName AND m.id IS NOT NULL");
    }
}
