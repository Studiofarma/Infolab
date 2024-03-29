package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.RoomSubscriptionEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@Component
public class RoomSubscriptionRepository {
    private final DataSource dataSource;

    @Autowired
    public RoomSubscriptionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void add(RoomSubscriptionEntity entity) throws DuplicateKeyException, SQLIntegrityConstraintViolationException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("rooms_subscriptions");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", entity.getRoomName().value());
        parameters.put("username", entity.getUsername().value());

        simpleJdbcInsert.execute(parameters);
    }
}
