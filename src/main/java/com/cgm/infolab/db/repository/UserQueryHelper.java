package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.Username;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

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

    public UserQueryResult query(String initialQuery) {
        String query = "%s from ".formatted(initialQuery);
        return new UserQueryResult(query);
    }
}
