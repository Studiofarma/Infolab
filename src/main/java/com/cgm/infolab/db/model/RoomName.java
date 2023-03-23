package com.cgm.infolab.db.model;

import java.util.Arrays;

public class RoomName {
    private final String value;

    private RoomName(String value) {
        this.value = value;
    }

    public static RoomName of(Username user1, Username user2) {
        String[] users = {user1.getValue(), user2.getValue()};
        Arrays.sort(users);
        // Il criterio con cui vengono create le room è mettere i nomi degli utenti in ordine lessicografico,
        // in modo da evitare room multiple tra gli stessi utenti
        String roomName = String.format("%s-%s", users[0], users[1]);
        return new RoomName(roomName);
    }

    public String getValue() {
        return value;
    }
}
