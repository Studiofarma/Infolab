package com.cgm.infolab.db.repository;

import com.cgm.infolab.controller.api.ChatApiMessagesController;
import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Component
public class AvatarRepository {
    private final DataSource dataSource;
    private final QueryHelper queryHelper;
    private final RowMappers rowMappers;

    private final Logger log = LoggerFactory.getLogger(ChatApiMessagesController.class);

    public AvatarRepository(DataSource dataSource, QueryHelper queryHelper, RowMappers rowMappers) {
        this.dataSource = dataSource;
        this.queryHelper = queryHelper;
        this.rowMappers = rowMappers;
    }

    public long add(AvatarEntity avatar, Username username) throws DuplicateKeyException, IllegalArgumentException {

        Map<String, Object> params = new HashMap<>();
        params.put("username", username.value());

        try {
            UserEntity userEntity = queryHelper
                    .query("SELECT *, status user_status")
                    .from("infolab.users")
                    .where("username = :username")
                    .executeForObject(rowMappers::mapToUserEntity, params);
        } catch (EmptyResultDataAccessException e) {
            log.warn("User with username=%s not found. It is impossible to create an avatar record.".formatted(username.value()));
            throw new IllegalArgumentException("User with username=%s not found.".formatted(username.value()));
        }

        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("avatars")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("image", avatar.getImage());

        long generatedId = (long) simpleJdbcInsert.executeAndReturnKey(parameters);

        params.put("id", generatedId);

        queryHelper
                .query("UPDATE infolab.users SET avatar_id = :id")
                .where("username = :username")
                .update(params);

        return generatedId;
    }

    public AvatarEntity getAvatarById(Username username, long id) throws EmptyResultDataAccessException {
        Map<String, Object> params = new HashMap<>();
        params.put("username", username.value());
        params.put("avatarId", id);

        return queryHelper
                .query("SELECT a.id av_id, a.image")
                .from("infolab.avatars a")
                .join("JOIN infolab.users u ON u.avatar_id = a.id")
                .where("a.id = :avatarId AND u.username = :username")
                .executeForObject(rowMappers::mapToAvatarEntity, params);
    }
}
