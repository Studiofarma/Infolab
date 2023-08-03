package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RoomAndMessagesVisibilityTests {
    @Autowired
    public ChatMessageRepository chatMessageRepository;
    @Autowired
    public RoomRepository roomRepository;
    @Autowired
    public ChatService chatService;
    @Autowired
    public TestDbHelper testDbHelper;

    public UserEntity[] users =
        {UserEntity.of(Username.of("user0")),
        UserEntity.of(Username.of("user1")),
        UserEntity.of(Username.of("user2")),
        UserEntity.of(Username.of("user3")),
        UserEntity.of(Username.of("user4")),
        UserEntity.of(Username.of("user5")),
        };

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public RoomEntity anotherPublic = RoomEntity.of(RoomName.of("public2"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP);

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
                ChatMessageDto.of("2 Visible only to user0 and user1", users[1].getName().value()),
                ChatMessageDto.of("3 Visible only to user1 and user2", users[1].getName().value()),
                ChatMessageDto.of("4 Visible only to user0 and user2", users[2].getName().value()),
                ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
                ChatMessageDto.of("6 Visible only to user1 and user2", users[2].getName().value()),
                ChatMessageDto.of("7 Visible only to user0 and user3", users[0].getName().value())
            };

    @BeforeAll
    void setUpAll() {
        testDbHelper.clearDbExceptForRooms();

        testDbHelper.addUsers(users);

        testDbHelper.addRooms(anotherPublic);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        chatService.saveMessageInDb(messageDtos[0], users[0].getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[1], users[0].getName(), RoomName.of("user0-user1"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[2], users[2].getName(), RoomName.of("user1-user2"), users[2].getName());
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), RoomName.of("user0-user2"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"), users[1].getName());
        chatService.saveMessageInDb(messageDtos[5], users[1].getName(), RoomName.of("user1-user2"), users[1].getName());
    }

    @Test
    void aUserCanSeeOnlyPublicRooms_OrItsPrivateRooms() {
        Assertions.assertNotNull(roomRepository.getByRoomName(general.getName(), users[0].getName()).orElse(null));
        Assertions.assertNotNull(roomRepository.getByRoomName(RoomName.of(users[0].getName(), users[1].getName()), users[0].getName()).orElse(null));
        Assertions.assertNotNull(roomRepository.getByRoomName(RoomName.of(users[0].getName(), users[2].getName()), users[0].getName()).orElse(null));
        Assertions.assertNull(roomRepository.getByRoomName(RoomName.of(users[1].getName(), users[2].getName()), users[0].getName()).orElse(null));
    }

    @Test
    void whenUser0QueriesForRoomsAndLastMessages_canSee4Rooms_1MessageEachIfPrivate_0MessagesIfPublic() {
        List<RoomEntity> roomsFromDb = new ArrayList<>(roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName()))
            .stream()
            .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
            .toList();

        for (RoomEntity r :
                roomsFromDb) {
            System.out.println(r.getName().value());
        }

        Assertions.assertEquals(4, roomsFromDb.size());

        Assertions.assertEquals(general.getName(), roomsFromDb.get(0).getName());
        Assertions.assertEquals(anotherPublic.getName(), roomsFromDb.get(1).getName());
        Assertions.assertEquals("user0-user1", roomsFromDb.get(2).getName().value());
        Assertions.assertEquals("user0-user2", roomsFromDb.get(3).getName().value());

        // NOTE: these assertions are needed to check whether the last messages returned is correct or not.
        //  For these to work the three previous assertions must be fulfilled.
        //  Actually the order of the rooms is not relevant.
        Assertions.assertEquals(messageDtos[0].getContent(), roomsFromDb.get(0).getMessages().get(0).getContent());
        Assertions.assertEquals(ChatMessageEntity.empty(), roomsFromDb.get(1).getMessages().get(0));
        Assertions.assertEquals(messageDtos[4].getContent(), roomsFromDb.get(2).getMessages().get(0).getContent());
        Assertions.assertEquals(messageDtos[3].getContent(), roomsFromDb.get(3).getMessages().get(0).getContent());
    }

    @Test
    void whenUser0QueriesForMessages_canSeeMessages_count4() {
        Assertions.assertEquals(1, chatMessageRepository.getByRoomName(RoomName.of("general"), loggedInUser.getName()).size());
        Assertions.assertEquals(2, chatMessageRepository.getByRoomName(RoomName.of("user0-user1"), loggedInUser.getName()).size());
        Assertions.assertEquals(1, chatMessageRepository.getByRoomName(RoomName.of("user0-user2"), loggedInUser.getName()).size());
        Assertions.assertEquals(0, chatMessageRepository.getByRoomName(RoomName.of("user1-user2"), loggedInUser.getName()).size());
    }

    @Test
    void whenUser0QueriesForRoomsAndUsers_canSee_rightRoomsAndRightUsers() {
        List<RoomEntity> roomEntities = roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(7, roomEntities.size());

        Assertions.assertEquals("general", roomEntities.get(0).getName().value());
        Assertions.assertEquals("public2", roomEntities.get(1).getName().value());
        Assertions.assertEquals("user0-user1", roomEntities.get(2).getName().value());
        Assertions.assertEquals("user0-user2", roomEntities.get(3).getName().value());
        Assertions.assertEquals("user0-user3", roomEntities.get(4).getName().value());
        Assertions.assertEquals("user4", roomEntities.get(5).getName().value());
        Assertions.assertEquals("user5", roomEntities.get(6).getName().value());
    }
}
