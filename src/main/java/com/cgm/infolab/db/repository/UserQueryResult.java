package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.Username;

public record UserQueryResult(
    String query,
    String joinKey,
    String conditions,
    String join,
    String other
){
    public UserQueryResult(String query) {
        this(query, "", null, "", "");
    }

    public UserQueryResult from(String table){
        return from(table, null);
    }

    public UserQueryResult from(String table, String foreignKeyColumn){
        String newQuery = String.format("%s%s x right join ", query, table);
        String foreignKey = foreignKeyColumn == null
            ? table
            : foreignKeyColumn;

        return new UserQueryResult(
            newQuery,
            "on r.id = x.%s_id ".formatted(foreignKey),
            conditions,
            join,
            other);
    }

    public UserQueryResult where(String conditions) {
        return new UserQueryResult(query, joinKey, conditions, join, other);
    }

    public UserQueryResult join(String join) {
        return new UserQueryResult(query, joinKey, conditions, join + " ", other);
    }

    public UserQueryResult other(String other) {
        return new UserQueryResult(query, joinKey, conditions, join, " " + other);
    }

    @Override
    public String query() {
        return query + "infolab.rooms r %s".formatted(joinKey) +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            (join == null
                ? ""
                : join) +
            "where (u.username = ? or r.visibility='PUBLIC')" +
            (conditions == null
                ? ""
                : " and (%s)".formatted(conditions)) +
            (other == null
                ? ""
                : other)
            ;
    }
}
