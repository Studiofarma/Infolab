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
import java.time.LocalDateTime;
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

    // Handy for testing
    public List<ChatMessageEntity> getByRoomName(RoomName roomName, Username username) {
        return getByRoomNameNumberOfMessages(roomName, -1, CursorEnum.NONE, null, username);
    }

    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(RoomName roomName,
                                                                 int pageSize,
                                                                 CursorEnum beforeOrAfter,
                                                                 LocalDateTime beforeOrAfterTimestamp,
                                                                 Username username) {

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomName", roomName.value());
        arguments.put("beforeOrAfterTimestamp", beforeOrAfterTimestamp);

        // IMPORTANT NOTE: the ordering method (ASC or DESC) needs to be changed based on the
        // cursor type (before or after) because if it was always DESC then page[after] would not work.
        // This because the limit clause returns the first N results that satisfy the condition of being before the cursor.
        // But if the ordering is DESC the first N records will be returned, not the closest ones to the cursor.
        // ----------------------------------------
        // Example: A B C D E F G. This list is ordered with timestamp DESC.
        // If I want to get 2 records after (timestamp) F then the set of records that are after the cursor
        // are A B C D E. Limit takes the first 2 records of the result, so it will take A and B, but we want D and E.
        // ----------------------------------------
        // By switching ordering method this gets resolved.
        String beforeOrAfterCondition;
        String ascOrDesc;
        if(beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
            beforeOrAfterCondition = ">";
            ascOrDesc = "ASC";
        } else {
            beforeOrAfterCondition = "<";
            ascOrDesc = "DESC";
        }

        String beforeOrAfterQuery;
        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE) || beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
            beforeOrAfterQuery = "AND m.sent_at %s :beforeOrAfterTimestamp".formatted(beforeOrAfterCondition);
        } else {
            beforeOrAfterQuery = "";
        }

        String limit = "";
        if (pageSize >= 0) {
            limit = "LIMIT :pageSize";
            arguments.put("pageSize", pageSize);
        }

        List<ChatMessageEntity> messageEntities = queryUserMessages("r.roomname = :roomName AND m.id IS NOT NULL %s".formatted(beforeOrAfterQuery),
                "ORDER BY m.sent_at %s %s".formatted(ascOrDesc, limit),
                username,
                arguments);

        if (beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
            Collections.reverse(messageEntities);
        }

        return messageEntities;
    }

    private List<ChatMessageEntity> queryUserMessages(String where, String other, Username username, Map<String, ?> queryParams) {
        try {
            return getMessages(username)
                    .where(where)
                    .other(other)
                    .executeForList(RowMappers::mapToChatMessageEntity, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private UserQueryResult getMessages(Username username) {
        return queryHelper
                .forUser(username)
                .query("SELECT m.id message_id, u_mex.id user_id, u_mex.username username, m.sender_id, r.id room_id, r.roomname, r.visibility, m.sent_at, m.content")
                .join("LEFT JOIN infolab.chatmessages m ON r.id = m.recipient_room_id LEFT JOIN infolab.users u_mex ON u_mex.id = m.sender_id");
    }
}
