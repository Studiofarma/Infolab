package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.RoomService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RoomAndMessagesVisibilityTests {
    @Autowired
    public ChatMessageRepository chatMessageRepository;
    @Autowired
    public RoomRepository roomRepository;
    @Autowired
    public UserRepository userRepository;
    @Autowired
    public RoomService roomService;
    @Autowired
    public ChatService chatService;

    public UserEntity[] users =
                    {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2"))};

    public RoomEntity[] rooms =
            {RoomEntity.of(RoomName.of("general"), VisibilityEnum.PUBLIC)};

    public ChatMessageEntity[] messageEntities =
            {ChatMessageEntity.of(users[0], rooms[0], new Timestamp(System.currentTimeMillis()).toLocalDateTime(), "Hello general from user0"),
                    ChatMessageEntity.of(users[1], RoomEntity.of(RoomName.of(users[0].getName(), users[1].getName()), VisibilityEnum.PRIVATE), new Timestamp(System.currentTimeMillis()).toLocalDateTime(), "Visible only to user0 and user1"),
                    ChatMessageEntity.of(users[1], RoomEntity.of(RoomName.of(users[1].getName(), users[2].getName()), VisibilityEnum.PRIVATE), new Timestamp(System.currentTimeMillis()).toLocalDateTime(), "Visible only to user1 and user2"),
                    ChatMessageEntity.of(users[2], RoomEntity.of(RoomName.of(users[0].getName(), users[2].getName()), VisibilityEnum.PRIVATE), new Timestamp(System.currentTimeMillis()).toLocalDateTime(), "Visible only to user0 and user2"),
                    ChatMessageEntity.of(users[0], RoomEntity.of(RoomName.of(users[0].getName(), users[1].getName()), VisibilityEnum.PRIVATE), new Timestamp(System.currentTimeMillis()).toLocalDateTime(), "Visible only to user0 and user1"),
                    ChatMessageEntity.of(users[2], RoomEntity.of(RoomName.of(users[0].getName(), users[2].getName()), VisibilityEnum.PRIVATE), new Timestamp(System.currentTimeMillis()).toLocalDateTime(), "Visible only to user1 and user2")};

    @BeforeAll
    void setUpAll() {
        // Add all users
        for (UserEntity user : users) {
            userRepository.add(user);
        }

        // Create some rooms and subscribe users
        roomRepository.add(rooms[0]);
        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[1].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[2].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[1].getName(), users[2].getName());

        // Add some messages
        for (ChatMessageEntity message : messageEntities) {
            chatMessageRepository.add(message);
        }
    }

    @Test
    void whenUser0QueriesForRooms_canSeeRooms_GeneralUser0w1User0w2() {
        List<RoomEntity> roomEntities = new ArrayList<>();
        roomEntities.add(roomRepository.getByRoomName(RoomName.of("general"), users[0].getName()).orElse(null));
        roomEntities.add(roomRepository.getByRoomName(RoomName.of(users[0].getName(), users[1].getName()), users[0].getName()).orElse(null));
        roomEntities.add(roomRepository.getByRoomName(RoomName.of(users[0].getName(), users[2].getName()), users[0].getName()).orElse(null));
        roomEntities.add(roomRepository.getByRoomName(RoomName.of(users[1].getName(), users[2].getName()), users[0].getName()).orElse(null));

        // Removes null rooms
        roomEntities.removeIf(Objects::isNull);

        Assertions.assertEquals(3, roomEntities.size());
    }
}
