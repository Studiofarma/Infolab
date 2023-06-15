package com.cgm.infolab.db.repository.queryhelper;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Map;

public record QueryResult (NamedParameterJdbcTemplate namedJdbcTemplate, String query) {

    public QueryResult(NamedParameterJdbcTemplate namedJdbcTemplate, String query) {
        this.namedJdbcTemplate = namedJdbcTemplate;
        this.query = query;
    }

    public QueryResult from(@NonNull String table) {
        String newQuery = query + table;
        return new QueryResult(namedJdbcTemplate, newQuery);
    }

    public QueryResult join(String join) {
        String newQuery = join == null ? query : query + " " + join;
        return new QueryResult(namedJdbcTemplate, newQuery);
    }

    public QueryResult where(String condition) {
        String newQuery = condition == null ? query : query + " where " + condition;
        return new QueryResult(namedJdbcTemplate, newQuery);
    }

    public QueryResult other(String other) {
        String newQuery = other == null ? query : query + " " + other;
        return new QueryResult(namedJdbcTemplate, newQuery);
    }

    public <T> List<T> executeForList(RowMapper<T> rowMapper, Map<String, ?> queryParams) throws EmptyResultDataAccessException {
        return namedJdbcTemplate.query(query, queryParams, rowMapper);
    }

    public <T> T executeForObject(RowMapper<T> rowMapper, Map<String, ?> queryParams) throws EmptyResultDataAccessException {
        return namedJdbcTemplate.queryForObject(query, queryParams, rowMapper);
    }
}
