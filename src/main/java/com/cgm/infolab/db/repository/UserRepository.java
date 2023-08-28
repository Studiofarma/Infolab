package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import com.cgm.infolab.db.repository.queryhelper.QueryResult;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.*;

@Component
public class UserRepository {
    private final QueryHelper queryHelper;
    private final DataSource dataSource;


    public UserRepository(QueryHelper queryHelper, DataSource dataSource) {
        this.queryHelper = queryHelper;
        this.dataSource = dataSource;
    }

    public UserEntity add(UserEntity user) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("users")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("username", user.getName().value());
        parameters.put("description", user.getDescription());
        parameters.put("status", user.getStatus().toString());
        return UserEntity.of((long)simpleJdbcInsert.executeAndReturnKey(parameters), user.getName(), user.getDescription());
    }

    public Optional<UserEntity> getByUsername(Username username) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("username", username.value());

        return queryUser("username = :username", arguments);
    }

    public Optional<UserEntity> getById(long id) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("userId", id);

        return queryUser("id = :userId", arguments);
    }

    private Optional<UserEntity> queryUser(String where, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    getUserOrUsers()
                            .where(where)
                            .executeForObject(RowMappers::mapToUserEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<UserEntity> getUsersByUsernames(List<Username> usernames) {
        List<String> usernamesStrings = usernames.stream().map(Username::value).toList();

        Map<String, Object> params = new HashMap<>();
        params.put("usernames", usernamesStrings);

        return queryUsers("username IN (:usernames)", "ORDER BY username ASC", params);
    }

    private List<UserEntity> queryUsers(String where, String other, Map<String, ?> queryParams) {
        try {
            return getUserOrUsers()
                    .where(where)
                    .other(other)
                    .executeForList(RowMappers::mapToUserEntity, queryParams);

        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private QueryResult getUserOrUsers() {
        return queryHelper
                .query("SELECT *, status user_status")
                .from("infolab.users");
    }
}
