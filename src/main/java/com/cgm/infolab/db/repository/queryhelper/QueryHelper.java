package com.cgm.infolab.db.repository.queryhelper;

import com.cgm.infolab.db.model.Username;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class QueryHelper {
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public QueryHelper(NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    public UserQueryHelper forUSer(Username username) {
        return new UserQueryHelper(namedJdbcTemplate, username);
    }

    public QueryResult query(String initialQuery) {
        String query = "%s from ".formatted(initialQuery);
        return new QueryResult(namedJdbcTemplate, query);
    }
}
