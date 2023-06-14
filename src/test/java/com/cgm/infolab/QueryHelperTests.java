package com.cgm.infolab;

import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.QueryHelper;
import com.cgm.infolab.db.repository.UserQueryResult;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

public class QueryHelperTests {

    @Test
    void withASimpleSelect_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new JdbcTemplate())
            .forUSer(Username.of(username))
            .query("Select *");

        String expectedQuery = "Select * " +
            "from infolab.rooms r " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            String.format("where (u.username = '%s' or r.visibility='PUBLIC')", username);

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAFrom_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new JdbcTemplate())
            .forUSer(Username.of(username))
            .query("Select *")
            .from("_anotherTable", "banana");

        String expectedQuery = "Select * " +
            "from _anotherTable x " +
            "right join infolab.rooms r on r.banana_id = x.id " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            String.format("where (u.username = '%s' or r.visibility='PUBLIC')", username);

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAWhere_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new JdbcTemplate())
            .forUSer(Username.of(username))
            .query("Select *")
            .where("x=? AND bla='foo'");

        String expectedQuery = "Select * " +
            "from infolab.rooms r " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            "where (u.username = '%s' or r.visibility='PUBLIC')".formatted(username) +
            " and (x=? AND bla='foo')"
            ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAFromAndAWhere_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new JdbcTemplate())
            .forUSer(Username.of(username))
            .query("Select *")
            .from("_anotherTable")
            .where("x=? AND bla='foo'");

        String expectedQuery = "Select * " +
            "from _anotherTable x " +
            "right join infolab.rooms r on r._anotherTable_id = x.id " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            "where (u.username = '%s' or r.visibility='PUBLIC')".formatted(username) +
            " and (x=? AND bla='foo')"
            ;

        Assertions.assertEquals(expectedQuery, query.query());
    }
}
