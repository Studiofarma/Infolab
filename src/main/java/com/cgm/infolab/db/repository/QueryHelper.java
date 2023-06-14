package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.Username;
import org.springframework.jdbc.core.JdbcTemplate;

public class QueryHelper {
    private final JdbcTemplate jdbcTemplate;

    public QueryHelper(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UserQueryHelper forUSer(Username username) {
        return new UserQueryHelper(jdbcTemplate, username);
    }
}
