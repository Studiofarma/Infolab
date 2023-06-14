package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.Username;

public record UserQueryResult(
    Username username,
    String query,
    String joinKey,
    String conditions
){
    public UserQueryResult(Username username, String query) {
        this(username, query, "", null);
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
            username,
            newQuery,
            "on r.%s_id = x.id ".formatted(foreignKey),
            conditions);
    }

    public UserQueryResult where(String conditions) {
        return new UserQueryResult(username, query, joinKey, conditions);
    }

    @Override
    public String query() {
        return query + "infolab.rooms r %s".formatted(joinKey) +
            "left join infolab.rooms_subscriptions s on r.id = s.room_id " +
            "left join infolab.users u on u.id = s.user_id " +
            String.format("where (u.username = '%s' or r.visibility='PUBLIC')", username.value()) +
            (conditions == null
                ? ""
                : " and (%s)".formatted(conditions))
            ;
    }
}
