package com.cgm.infolab.db.model;

import java.util.Arrays;

public record RoomName(String value) {

    public static RoomName of(Username user1, Username user2) {
        String[] users = {user1.value(), user2.value()};
        Arrays.sort(users);
        // Il criterio con cui vengono create le room è mettere i nomi degli utenti in ordine lessicografico,
        // in modo da evitare room multiple tra gli stessi utenti
        String roomName = String.format("%s-%s", users[0], users[1]);
        return new RoomName(roomName);
    }

    public static RoomName of(String roomName) {
        if (!roomName.contains("-")) {
            // Esclude dal controllo room come general che non contengono -.
            // Altrimenti va in crash.
            return new RoomName(roomName);

        }

        Username user1 = Username.of(roomName.substring(0, roomName.indexOf("-")));
        Username user2 = Username.of(roomName.substring(roomName.indexOf("-") + 1));

        return RoomName.of(user1, user2); // Così avviene lo stesso il controllo della correttezza del nome.
    }
}
