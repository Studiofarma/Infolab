package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.Username;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.function.Function;

public class UserQueryHelper {
    private final JdbcTemplate jdbcTemplate;
    private final Username username;

    public UserQueryHelper(JdbcTemplate jdbcTemplate, Username username) {
        this.jdbcTemplate = jdbcTemplate;
        this.username = username;
    }

    public <T> List<T> query(String query, RowMapper<T> mapper, Object[] queryParams) {
        return null;
    }

    public String query(String initialQuery) {
        return initialQuery + " from infolab.rooms r " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            String.format("where (u.username = '%s' or r.visibility='PUBLIC')", username.value());
    }
}
