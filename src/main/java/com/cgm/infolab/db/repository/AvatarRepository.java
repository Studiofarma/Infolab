package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.AvatarEntity;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Component
public class AvatarRepository {
    private final DataSource dataSource;

    public AvatarRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public long add(AvatarEntity avatar) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("avatars")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("image", avatar.getImage());

        return (long) simpleJdbcInsert.executeAndReturnKey(parameters);
    }
}
