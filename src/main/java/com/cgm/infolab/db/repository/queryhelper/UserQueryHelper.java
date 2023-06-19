package com.cgm.infolab.db.repository.queryhelper;

import com.cgm.infolab.db.model.Username;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.List;

public class UserQueryHelper {
    private final NamedParameterJdbcTemplate namedJdbcTemplate;
    private final Username username;

    public UserQueryHelper(NamedParameterJdbcTemplate namedJdbcTemplate, Username username) {
        this.namedJdbcTemplate = namedJdbcTemplate;
        this.username = username;
    }

    public <T> List<T> query(String query, RowMapper<T> mapper, Object[] queryParams) {
        return null;
    }

    public UserQueryResult query(String initialQuery) {
        String query = "%s from ".formatted(initialQuery);
        return new UserQueryResult(namedJdbcTemplate, username, query);
    }
}
