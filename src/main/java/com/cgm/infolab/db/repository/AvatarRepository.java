package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.ID;
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
import java.util.Optional;

@Component
public class AvatarRepository {
    private final DataSource dataSource;
    private final QueryHelper queryHelper;
    private final RowMappers rowMappers;

    private final Logger log = LoggerFactory.getLogger(AvatarRepository.class);

    public AvatarRepository(DataSource dataSource, QueryHelper queryHelper, RowMappers rowMappers) {
        this.dataSource = dataSource;
        this.queryHelper = queryHelper;
        this.rowMappers = rowMappers;
    }

    public Long addOrUpdate(AvatarEntity avatar, Username username) throws DuplicateKeyException, IllegalArgumentException {

        Map<String, Object> params = new HashMap<>();
        params.put("username", username.value());

        UserEntity userEntity;

        try {
             userEntity = queryHelper
                    .query("SELECT *, status user_status")
                    .from("infolab.users")
                    .where("username = :username")
                    .executeForObject(rowMappers::mapToUserEntity, params);
        } catch (EmptyResultDataAccessException e) {
            log.warn("User with username=%s not found. It is impossible to create an avatar record.".formatted(username.value()));
            throw new IllegalArgumentException("User with username=%s not found.".formatted(username.value()));
        }

        if (userEntity.getAvatarId().isEmpty()) {
            return simpleAdd(avatar, params);
        } else {
            avatar.setId(userEntity.getAvatarId().get());
            simpleUpdate(avatar);
            return null;
        }
    }

    private long simpleAdd(AvatarEntity avatar, Map<String, Object> params) {
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

    private void simpleUpdate(AvatarEntity avatar) {
        Map<String, Object> params = new HashMap<>();
        params.put("image", avatar.getImage());
        params.put("avatarId", avatar.getId());

        queryHelper
                .query("UPDATE infolab.avatars SET image = :image")
                .where("id = :avatarId")
                .update(params);
    }

    public Optional<AvatarEntity> getAvatarById(long id) {
        Map<String, Object> params = new HashMap<>();
        params.put("avatarId", id);

        try {
            return Optional.ofNullable(
                    queryHelper
                    .query("SELECT a.id av_id, a.image")
                    .from("infolab.avatars a")
                    .where("a.id = :avatarId")
                    .executeForObject(rowMappers::mapToAvatarEntity, params)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
