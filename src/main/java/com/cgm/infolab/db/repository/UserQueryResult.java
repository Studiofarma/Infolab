package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.Username;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
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
        return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join + " ", other);
    }

    public UserQueryResult other(String other) {
        return new UserQueryResult(namedJdbcTemplate, username, query, joinKey, conditions, join, " " + other);
    }

    @Override
    public String query() {
        return query + "infolab.rooms r %s".formatted(joinKey) +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            (join == null
                ? ""
                : join) +
            "where (u.username = :accessControlUsername or r.visibility='PUBLIC')" +
            (conditions == null
                ? ""
                : " and (%s)".formatted(conditions)) +
            (other == null
                ? ""
                : other)
            ;
    }

    public <T> List<T> execute(RowMapper<T> rowMapper, Map<String, ?> queryParams) throws InvalidUserKeyException, EmptyResultDataAccessException {

        if (queryParams.containsKey("accessControlUsername"))
            throw new InvalidUserKeyException();

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("accessControlUsername", username.value());
        params.addValues(queryParams);

        return namedJdbcTemplate.query(this.query(), params, rowMapper);
    }

    public class InvalidUserKeyException extends RuntimeException {
        private InvalidUserKeyException() {
            super("The key accessControlUsername cannot be used for queryParams");
        }
    }
}
