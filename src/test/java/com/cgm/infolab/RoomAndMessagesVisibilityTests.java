package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.RoomService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
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

    public ChatMessageDto[] messageDtos =
            {new ChatMessageDto("Hello general from user0", users[0].getName().value()),
                new ChatMessageDto("Visible only to user0 and user1", users[1].getName().value()),
                new ChatMessageDto("Visible only to user1 and user2", users[1].getName().value()),
                new ChatMessageDto("Visible only to user0 and user2", users[2].getName().value()),
                new ChatMessageDto("Visible only to user0 and user1", users[0].getName().value()),
                new ChatMessageDto("Visible only to user1 and user2", users[2].getName().value())};

    @BeforeAll
    void setUpAll() {
        // Add all users
        for (UserEntity user : users) {
            try {
                userRepository.add(user);
            } catch (DuplicateKeyException e) {
                System.out.printf("User username=\"%s\" già esistente nel database", user.getName().value());
            }
        }

        // Create some rooms and subscribe users
        try {
            roomRepository.add(rooms[0]);
        } catch (DuplicateKeyException e) {
            System.out.printf("Room room=\"%s\" già esistente nel database%n", "general");
        }
        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[1].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[2].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[1].getName(), users[2].getName());

        // Add some messages
        chatService.saveMessageInDb(messageDtos[0], users[0].getName(), RoomName.of("general"));
        chatService.saveMessageInDb(messageDtos[1], users[1].getName(), RoomName.of("user0-user1"));
        chatService.saveMessageInDb(messageDtos[2], users[1].getName(), RoomName.of("user1-user2"));
        chatService.saveMessageInDb(messageDtos[3], users[2].getName(), RoomName.of("user0-user2"));
        chatService.saveMessageInDb(messageDtos[4], users[0].getName(), RoomName.of("user0-user1"));
        chatService.saveMessageInDb(messageDtos[5], users[2].getName(), RoomName.of("user0-user2"));
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

        // This because the last room that this test tries to get will return null if it does not exist.
        Assertions.assertEquals(3, roomEntities.size());
    }
}
