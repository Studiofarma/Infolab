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

    public UserQueryHelper forUser(Username username) {
        return new UserQueryHelper(namedJdbcTemplate, username);
    }

    public QueryResult query(String initialQuery) {
        return new QueryResult(namedJdbcTemplate, initialQuery);
    }
}
