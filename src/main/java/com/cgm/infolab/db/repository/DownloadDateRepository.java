package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.DownloadDateEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@Component
public class DownloadDateRepository {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;

    private final String INSERT_WHERE_NOT_READ_YET_QUERY =
            "INSERT INTO infolab.download_dates( " +
                "\"timestamp\", user_id, message_id) " +
                "SELECT ?, ?, m.id message_id " +       // timestamp, user id
                    "FROM infolab.chatmessages m  " +
                    "LEFT JOIN infolab.rooms r " +
                    "ON r.id = m.recipient_room_id " +
                    "LEFT JOIN infolab.users u " +
                    "ON u.id = m.sender_id " +
                    "LEFT JOIN infolab.download_dates d " +
                    "ON m.id = d.message_id " +
                    "WHERE EXISTS (SELECT s.room_id FROM infolab.rooms_subscriptions s " +
                        "RIGHT JOIN infolab.users u " +
                        "ON s.user_id = u.id " +
                        "WHERE (u.username = ? OR r.visibility = 'PUBLIC')) " +     // username
                    "AND NOT EXISTS ((SELECT * FROM infolab.users u1 " +
                        "RIGHT JOIN infolab.download_dates d1 " +
                        "ON d1.user_id = u1.id " +
                        "WHERE (u1.username = ? AND m.id = d1.message_id))) " +     // username
                    "AND r.roomname = ?";   // roomid

    public DownloadDateRepository(JdbcTemplate jdbcTemplate, DataSource dataSource, UserRepository userRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.userRepository = userRepository;
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

    public void addWhereNotDownloadedYetForUser(UserEntity user, RoomEntity room) throws IllegalArgumentException {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        user = userRepository.getByUsername(user.getName()).orElseThrow(IllegalArgumentException::new);

        jdbcTemplate.update(INSERT_WHERE_NOT_READ_YET_QUERY,
                timestamp,
                user.getId(),
                user.getName().value(),
                user.getName().value(),
                room.getName().value());
    }
}
