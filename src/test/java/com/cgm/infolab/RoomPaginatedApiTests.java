package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RoomPaginatedApiTests {
    @Autowired
    TestRestTemplate testRestTemplate;
    @Autowired
    TestApiHelper testApiHelper;
    @Autowired
    TestDbHelper testDbHelper;
    @Autowired
    ChatService chatService;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0"), "user0 desc"),
                    UserEntity.of(Username.of("user1"), "user1 desc"),
                    UserEntity.of(Username.of("user2"), "user2 desc"),
                    UserEntity.of(Username.of("user3"), "user3 desc"),
                    UserEntity.of(Username.of("user4"), "user4 desc"),
                    UserEntity.of(Username.of("user5"), "user5 desc"),
            };

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
                    ChatMessageDto.of("2 Visible only to user0 and user1", users[1].getName().value()),
                    ChatMessageDto.of("3 Visible only to user1 and user2", users[1].getName().value()),
                    ChatMessageDto.of("4 Visible only to user0 and user2", users[2].getName().value()),
                    ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
                    ChatMessageDto.of("6 Visible only to user1 and user2", users[2].getName().value())
            };

    public RoomEntity general = RoomEntity.general();
    public RoomEntity public2 = RoomEntity.of(RoomName.of("public2"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 2 desc");

    @BeforeAll
    void setUp() {
        testDbHelper.clearDb();

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        testDbHelper.addRooms(general, public2);

        chatService.saveMessageInDb(messageDtos[0], users[0].getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[1], users[0].getName(), RoomName.of("user0-user1"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[2], users[2].getName(), RoomName.of("user1-user2"), users[2].getName());
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), RoomName.of("user0-user2"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"), users[1].getName());
    }

    @Test
    void whenFetching_withoutPageSize_responseIsOfAllUsers() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/rooms2")
                .stream()
                .sorted(Comparator.comparing(linkedHashMap -> linkedHashMap.get("roomName").toString()))
                .toList();

        Assertions.assertEquals(7, responseBody.size());
    }

    @Test
    void whenFetching_withPageSize2_responseIsOf2FirstUsers() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/rooms2?page[size]=2");

        Assertions.assertEquals(2, responseBody.size());
    }
}
