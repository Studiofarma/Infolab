package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DownloadDateRepository {
    private final QueryHelper queryHelper;
    private final DataSource dataSource;

    protected static final String DOWNLOAD_DATES_JOIN =
            "JOIN infolab.chatmessages m " +
                    "ON m.recipient_room_id = r.id " +
                    "JOIN infolab.users u_logged " +
                    "ON u_logged.username = :username " +
                    "LEFT JOIN infolab.download_dates d " +
                    "ON d.username = u_logged.username AND d.message_id = m.id";
    protected static final String DOWNLOAD_DATES_WHERE_NULL = "d.download_timestamp IS NULL";
    protected static final String DOWNLOAD_DATES_WHERE_NOT_DOWNLOADED_AND_ROOMNAME =
            DOWNLOAD_DATES_WHERE_NULL + " AND r.roomname = :roomName";

    public DownloadDateRepository(QueryHelper queryHelper, DataSource dataSource) {
        this.queryHelper = queryHelper;
        this.dataSource = dataSource;
    }

    public void add(DownloadDateEntity entity) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("users");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("timestamp", entity.getTimestamp());
        parameters.put("user_id", entity.getUserId());
        parameters.put("username", entity.getUsername().value());
        parameters.put("message_id", entity.getMessageId());
        simpleJdbcInsert.execute(parameters);
    }

    public int addWhereNotDownloadedYetForUser(Username username, RoomName roomName) throws IllegalArgumentException {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("timestamp", timestamp);
        arguments.put("username", username.value());
        arguments.put("roomName", roomName.value());

        return queryHelper
                .forUser(username)
                .query("INSERT INTO infolab.download_dates (download_timestamp, username, message_id) SELECT :timestamp, :username, m.id")
                .join(DOWNLOAD_DATES_JOIN)
                .where(DOWNLOAD_DATES_WHERE_NOT_DOWNLOADED_AND_ROOMNAME)
                .update(arguments);
    }

    public int addDownloadDateToMessages(Username username, List<Long> messageIds) {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("timestamp", timestamp);
        arguments.put("username", username.value());
        arguments.put("messageIds", messageIds);

        return queryHelper
                .forUser(username)
                .query("INSERT INTO infolab.download_dates (download_timestamp, username, message_id) SELECT :timestamp, :username, m.id")
                .join("join infolab.chatmessages m on m.recipient_room_id = r.id join infolab.users u_logged on u_logged.username = :username")
                .where("m.id IN (:messageIds)")
                .update(arguments);
    }
}
