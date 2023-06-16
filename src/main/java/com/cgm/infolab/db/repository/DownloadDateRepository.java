package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@Component
public class DownloadDateRepository {
    private final QueryHelper queryHelper;
    private final DataSource dataSource;

    private final String DOWNLOAD_DATES_INSERT_SELECT =
            "INSERT INTO infolab.download_dates(download_timestamp, user_id, message_id) SELECT :timestamp, u_logged.id, m.id";
    private final String DOWNLOAD_DATES_JOIN =
            "LEFT JOIN infolab.chatmessages m " +
                    "ON m.recipient_room_id = r.id " +
                    "LEFT JOIN infolab.users u_logged " +
                    "ON u_logged.username = :username " +
                    "LEFT JOIN infolab.download_dates d " +
                    "ON d.user_id = u_logged.id AND d.message_id = m.id";
    private final String DOWNLOAD_DATES_WHERE_NOT_DOWNLOADED_AND_ROOMNAME =
            "d.download_timestamp IS NULL AND r.roomname = :roomName";

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
        parameters.put("message_id", entity.getMessageId());
        simpleJdbcInsert.execute(parameters);
    }

    public void addWhereNotDownloadedYetForUser(Username username, RoomName roomName) throws IllegalArgumentException {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        Map<String, Object> map = new HashMap<>();
        map.put("timestamp", timestamp);
        map.put("username", username.value());
        map.put("roomName", roomName.value());

        queryHelper
                .forUser(username)
                .query(DOWNLOAD_DATES_INSERT_SELECT)
                .join(DOWNLOAD_DATES_JOIN)
                .where(DOWNLOAD_DATES_WHERE_NOT_DOWNLOADED_AND_ROOMNAME)
                .update(map);
    }
}
