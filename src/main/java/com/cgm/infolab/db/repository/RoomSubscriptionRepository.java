package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.RoomSubscriptionEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Component
public class RoomSubscriptionRepository {
    private final DataSource dataSource;

    @Autowired
    public RoomSubscriptionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void add(RoomSubscriptionEntity entity) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("room_subscriptions");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("room_id", entity.getRoomId());
        parameters.put("user_id", entity.getUserId());
        simpleJdbcInsert.execute(parameters);
    }
}
