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

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity[] rooms =
            {RoomEntity.of(RoomName.of("general"), VisibilityEnum.PUBLIC)};

    public ChatMessageDto[] messageDtos =
            {new ChatMessageDto("1 Hello general from user0", users[0].getName().value()),
                new ChatMessageDto("2 Visible only to user0 and user1", users[1].getName().value()),
                new ChatMessageDto("3 Visible only to user1 and user2", users[1].getName().value()),
                new ChatMessageDto("4 Visible only to user0 and user2", users[2].getName().value()),
                new ChatMessageDto("5 Visible only to user0 and user1", users[0].getName().value()),
                new ChatMessageDto("6 Visible only to user1 and user2", users[2].getName().value())};

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
        chatService.saveMessageInDb(messageDtos[1], users[0].getName(), RoomName.of("user0-user1"));
        chatService.saveMessageInDb(messageDtos[2], users[2].getName(), RoomName.of("user1-user2"));
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), RoomName.of("user0-user2"));
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"));
        chatService.saveMessageInDb(messageDtos[5], users[1].getName(), RoomName.of("user1-user2"));

        RoomEntity room = roomRepository.getByRoomNameEvenIfNotSubscribed(RoomName.of("user1-user2")).orElse(null);
        System.out.println(room.getVisibility());
    }

    @Test
    void whenUser0QueriesForRooms_canSeeRooms_GeneralUser0w1User0w2() {
        List<RoomEntity> roomsFromDb = new ArrayList<>();
        roomsFromDb.add(roomRepository.getByRoomName(RoomName.of("general"), users[0].getName()).orElse(null));
        roomsFromDb.add(roomRepository.getByRoomName(RoomName.of(users[0].getName(), users[1].getName()), users[0].getName()).orElse(null));
        roomsFromDb.add(roomRepository.getByRoomName(RoomName.of(users[0].getName(), users[2].getName()), users[0].getName()).orElse(null));
        roomsFromDb.add(roomRepository.getByRoomName(RoomName.of(users[1].getName(), users[2].getName()), users[0].getName()).orElse(null));

        // Removes null rooms
        roomsFromDb.removeIf(Objects::isNull);

        // This because the last room that this test tries to get will return null if it does not exist.
        Assertions.assertEquals(3, roomsFromDb.size());
    }

    @Test
    void whenUser0QueriesForRoomsAndLastMessages_canSee3RoomsInOrderWith1MessageEach() {
        List<RoomEntity> roomsFromDb = new ArrayList<>(roomRepository.getAllWhereLastMessageNotNull(Username.of("user0")));

        Assertions.assertEquals(3, roomsFromDb.size());

        Assertions.assertEquals("general", roomsFromDb.get(0).getName().value());
        Assertions.assertEquals("user0-user1", roomsFromDb.get(1).getName().value());
        Assertions.assertEquals("user0-user2", roomsFromDb.get(2).getName().value());

        // NOTE: these assertions are needed to check whether the last messages returned is correct.
        //  For these to work the three previous assertions must be fulfilled.
        //  Actually the order of the rooms is not relevant.
        Assertions.assertEquals("1 Hello general from user0", roomsFromDb.get(0).getMessages().get(0).getContent());
        Assertions.assertEquals("5 Visible only to user0 and user1", roomsFromDb.get(1).getMessages().get(0).getContent());
        Assertions.assertEquals("4 Visible only to user0 and user2", roomsFromDb.get(2).getMessages().get(0).getContent());
    }

    @Test
    void whenUser0QueriesForMessages_canSeeMessages_count4() {
        List<ChatMessageEntity> messagesFromDb = new ArrayList<>();
        messagesFromDb.addAll(chatMessageRepository.getByRoomName(RoomName.of("general"), loggedInUser.getName())); // Gets from room general
        messagesFromDb.addAll(chatMessageRepository.getByRoomName(RoomName.of("user0-user1"), loggedInUser.getName())); // Gets from room user0-user1
        messagesFromDb.addAll(chatMessageRepository.getByRoomName(RoomName.of("user0-user2"), loggedInUser.getName())); // Gets from room user0-user2

        messagesFromDb.addAll(chatMessageRepository.getByRoomName(RoomName.of("user1-user2"), loggedInUser.getName())); // Gets from room user1-user2 (should return empty array)

        Assertions.assertEquals(4, messagesFromDb.size());
    }
}
