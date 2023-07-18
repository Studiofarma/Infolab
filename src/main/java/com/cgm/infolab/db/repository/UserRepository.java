package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.CursorEnum;
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

    public List<UserEntity> getByUsernameWithLike(Username username) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("similarUsername", username.value());
        return queryUsers("username ILIKE :similarUsername || '%%'", "ORDER BY description ASC", arguments);
    }

    public List<UserEntity> getByUsernameWithLike(Username username, int pageSize, CursorEnum beforeOrAfter, String beforeOrAfterDescription) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("similarUsername", username.value());
        arguments.put("beforeOrAfterDescription", beforeOrAfterDescription);

        // IMPORTANT NOTE: the ordering method (ASC or DESC) needs to be changed based on the
        // cursor type (before or after) because if it was always ASC then page[before] would not work.
        // This because the limit clause returns the first N results that satisfy the condition of being before the cursor.
        // But if the ordering is ASC the first N records will be returned, not the closest ones to the cursor.
        // ----------------------------------------
        // Example: A B C D E F G. If I want to get 2 records before F then the set of records that are before the cursor
        // are A B C D E. Limit takes the first 2 records of the result, so it will take A and B, but we want D and E.
        // ----------------------------------------
        // By switching ordering method this gets resolved.
        String beforeOrAfterCondition;
        String ascOrDesc;
        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            beforeOrAfterCondition = "<";
            ascOrDesc = "DESC";
        } else {
            beforeOrAfterCondition = ">";
            ascOrDesc = "ASC";
        }

        String beforeOrAfterQuery;
        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE) || beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
            beforeOrAfterQuery = "AND description %s :beforeOrAfterDescription".formatted(beforeOrAfterCondition);
        } else {
            beforeOrAfterQuery = "";
        }

        String limit = "";
        if (pageSize >= 0) {
            limit = "LIMIT :pageSize";
            arguments.put("pageSize", pageSize);
        }

        List<UserEntity> userEntities = queryUsers("username ILIKE :similarUsername || '%%' %s".formatted(beforeOrAfterQuery),
                "ORDER BY description %s %s".formatted(ascOrDesc, limit), arguments);

        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            Collections.reverse(userEntities);
        }

        return userEntities;
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
                .query("SELECT *")
                .from("infolab.users");
    }
}
