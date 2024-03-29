package com.cgm.infolab.db.repository.queryhelper;

import com.cgm.infolab.db.model.Username;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.List;
import java.util.Map;

public record UserQueryResult(
    NamedParameterJdbcTemplate namedJdbcTemplate,
    Username username,
    String query,
    String joinKey,
    String conditions,
    String join,
    String other
){
    public UserQueryResult(NamedParameterJdbcTemplate namedJdbcTemplate, Username username, String query) {
        this(namedJdbcTemplate, username, query, "", null, "", "");
    }

    public UserQueryResult from(String table){
        return from(table, null);
    }

    public UserQueryResult from(String table, String foreignKeyColumn){
        String newQuery = String.format("%s%s x right join ", query, table);
        String foreignKey = foreignKeyColumn == null
            ? table
            : foreignKeyColumn;

        return new UserQueryResult(
            namedJdbcTemplate,
            username,
            newQuery,
            "on r.id = x.%s_id ".formatted(foreignKey),
            conditions,
            join,
            other);
    }

    public UserQueryResult where(String conditions) {
        return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join, other);
    }

    public UserQueryResult join(String join) {
        if (join == null)
            return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join, other);
        else
            return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join + " ", other);
    }

    public UserQueryResult other(String other) {
        if (other == null)
            return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join, other);
        else
            return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join, " " + other);
    }

    @Override
    public String query() {
        return query + "infolab.rooms r %s".formatted(joinKey) +
            "left join infolab.rooms_subscriptions s on r.roomname = s.roomname " +
            (join == null
                ? ""
                : join) +
            "where (s.username = :accessControlUsername or r.visibility='PUBLIC')" +
            (conditions == null
                ? ""
                : " and (%s)".formatted(conditions)) +
            (other == null
                ? ""
                : other)
            ;
    }

    public <T> List<T> executeForList(RowMapper<T> rowMapper, Map<String, ?> queryParams) throws InvalidUserKeyException, EmptyResultDataAccessException {

        checkInputKeysAndThrow(queryParams);

        MapSqlParameterSource params = addAllParams(queryParams);

        return namedJdbcTemplate.query(this.query(), params, rowMapper);
    }

    public <T> T executeForObject(RowMapper<T> rowMapper, Map<String, ?> queryParams) throws InvalidUserKeyException, EmptyResultDataAccessException {

       checkInputKeysAndThrow(queryParams);

        MapSqlParameterSource params = addAllParams(queryParams);

        return namedJdbcTemplate.queryForObject(this.query(), params, rowMapper);
    }

    public int update(Map<String, ?> queryParams) {
        checkInputKeysAndThrow(queryParams);

        MapSqlParameterSource params = addAllParams(queryParams);

        return namedJdbcTemplate.update(this.query(), params);
    }

    private void checkInputKeysAndThrow(Map<String, ?> queryParams) throws InvalidUserKeyException {
        if (queryParams.containsKey("accessControlUsername"))
            throw new InvalidUserKeyException();
    }

    private MapSqlParameterSource addAllParams(Map<String, ?> params) {
        MapSqlParameterSource paramsMap = new MapSqlParameterSource();
        paramsMap.addValue("accessControlUsername", username.value());
        paramsMap.addValues(params);
        return paramsMap;
    }

    public class InvalidUserKeyException extends RuntimeException {
        private InvalidUserKeyException() {
            super("The key accessControlUsername cannot be used for queryParams");
        }
    }
}
