package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.QueryHelper;
import com.cgm.infolab.db.repository.UserQueryResult;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QueryHelperTests {

    @Test
    void withASimpleSelect_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
            .forUSer(Username.of(username))
            .query("Select *");

        String expectedQuery = "Select * " +
            "from infolab.rooms r " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            "where (u.username = :accessControlUsername or r.visibility='PUBLIC')";

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAFrom_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
            .forUSer(Username.of(username))
            .query("Select *")
            .from("_anotherTable", "banana");

        String expectedQuery = "Select * " +
            "from _anotherTable x " +
            "right join infolab.rooms r on r.id = x.banana_id " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            "where (u.username = :accessControlUsername or r.visibility='PUBLIC')";

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAWhere_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
            .forUSer(Username.of(username))
            .query("Select *")
            .where("x=? AND bla='foo'");

        String expectedQuery = "Select * " +
            "from infolab.rooms r " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            "where (u.username = :accessControlUsername or r.visibility='PUBLIC')" +
            " and (x=? AND bla='foo')"
            ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAFromAndAWhere_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
            .forUSer(Username.of(username))
            .query("Select *")
            .from("_anotherTable")
            .where("x=? AND bla='foo'");

        String expectedQuery = "Select * " +
            "from _anotherTable x " +
            "right join infolab.rooms r on r.id = x._anotherTable_id " +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            "where (u.username = :accessControlUsername or r.visibility='PUBLIC')" +
            " and (x=? AND bla='foo')"
            ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAJoin_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
                .forUSer(Username.of(username))
                .query("Select *")
                .join("left join _another_table x on x._foreign_key_id = r.id");

        String expectedQuery = "Select * " +
                "from infolab.rooms r " +
                "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
                "left join infolab.users u on u.id = s.user_id " +
                "left join _another_table x on x._foreign_key_id = r.id " +
                "where (u.username = :accessControlUsername or r.visibility='PUBLIC')"
                ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndAJoinAndWhere_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
                .forUSer(Username.of(username))
                .query("Select *")
                .join("left join _another_table x on x._foreign_key_id = r.id")
                .where("x=? and OwO = 'foo'");

        String expectedQuery = "Select * " +
                "from infolab.rooms r " +
                "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
                "left join infolab.users u on u.id = s.user_id " +
                "left join _another_table x on x._foreign_key_id = r.id " +
                "where (u.username = :accessControlUsername or r.visibility='PUBLIC') " +
                "and (x=? and OwO = 'foo')"
                ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndOther_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
                .forUSer(Username.of(username))
                .query("Select *")
                .other("order by foo desc limit 69");

        String expectedQuery = "Select * " +
                "from infolab.rooms r " +
                "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
                "left join infolab.users u on u.id = s.user_id " +
                "where (u.username = :accessControlUsername or r.visibility='PUBLIC') " +
                "order by foo desc limit 69"
                ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndJoinAndOther_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
                .forUSer(Username.of(username))
                .query("Select *")
                .join("left join _another_table x on x._foreign_key_id = r.id")
                .other("order by foo desc limit 69");

        String expectedQuery = "Select * " +
                "from infolab.rooms r " +
                "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
                "left join infolab.users u on u.id = s.user_id " +
                "left join _another_table x on x._foreign_key_id = r.id " +
                "where (u.username = :accessControlUsername or r.visibility='PUBLIC') " +
                "order by foo desc limit 69"
                ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void withASelectAndJoinAndWhereAndOther_ItAddFilters_ForUser() {
        String username = "pippo";
        UserQueryResult query = new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
                .forUSer(Username.of(username))
                .query("Select *")
                .join("left join _another_table x on x._foreign_key_id = r.id")
                .where("cool = true or t=?")
                .other("order by foo desc limit 69");

        String expectedQuery = "Select * " +
                "from infolab.rooms r " +
                "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
                "left join infolab.users u on u.id = s.user_id " +
                "left join _another_table x on x._foreign_key_id = r.id " +
                "where (u.username = :accessControlUsername or r.visibility='PUBLIC') " +
                "and (cool = true or t=?) " +
                "order by foo desc limit 69"
                ;

        Assertions.assertEquals(expectedQuery, query.query());
    }

    @Test
    void whenExecuteMethodCalledWithInvalidUsernameKey_exceptionIsThrown() {
        String username = "pippo";

        Map<String, Object> map = new HashMap<>();
        map.put("accessControlUsername", username);

        Assertions.assertThrows(UserQueryResult.InvalidUserKeyException.class, () -> {
            new QueryHelper(new NamedParameterJdbcTemplate(new JdbcTemplate()))
                    .forUSer(Username.of(username))
                    .query("Select *")
                    .join("left join _another_table x on x._foreign_key_id = r.id")
                    .where("cool = true or t=?")
                    .other("order by foo desc limit 69")
                    .execute((rs, rowNum) -> null, map);
        });
    }
}
