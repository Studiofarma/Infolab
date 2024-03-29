package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.Username;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class RoomNameTests {

    @Test
    void aRoomNameShouldBeGenerated_FromTwoUsersName_AlphabeticallyOrdered() {
        RoomName roomName = RoomName.of(Username.of("b"), Username.of("A"));
        Assertions.assertEquals("a-b", roomName.value());
    }

    @Test
    void aRoomNameShouldBeGenerated_FromOneString_AlphabeticallyOrdered() {
        RoomName roomName = RoomName.of("b-a");
        Assertions.assertEquals("a-b", roomName.value());
    }
}
