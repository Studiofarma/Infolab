package com.cgm.infolab;

import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.QueryHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

public class QueryHelperTests {

    @Test
    void withASimpleSelect_ItAddFilters_ForUser() {
        String username = "pippo";
        String query = new QueryHelper(new JdbcTemplate())
            .forUSer(Username.of(username))
            .query("Select *");

        String expectedQuery = "Select * " +
            "from infolab.rooms r " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            String.format("where (u.username = '%s' or r.visibility='PUBLIC')", username);

        Assertions.assertEquals(expectedQuery, query);
    }
}
