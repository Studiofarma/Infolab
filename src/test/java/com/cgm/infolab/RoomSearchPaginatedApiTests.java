package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.BasicJsonDto;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.PaginationLinksDto;
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

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RoomSearchPaginatedApiTests {
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
                    ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value())
            };

    public RoomEntity general = RoomEntity.general();
    public RoomEntity public2 = RoomEntity.of(RoomName.of("public2"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 2 desc");
    public RoomEntity public3 = RoomEntity.of(RoomName.of("public3"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 3 desc");
    public RoomEntity public4 = RoomEntity.of(RoomName.of("public4"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 4 desc");
    public static final LocalDateTime STARTING_TIME = LocalDateTime.of(2023, 6, 1, 1, 1, 1, 1000000);


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

        testDbHelper.addRooms(general, public2, public3, public4);

        testDbHelper.insertCustomMessage(1, users[0].getName().value(), general.getName().value(), STARTING_TIME, "1 Hello general from user0");
        testDbHelper.insertCustomMessage(2, users[1].getName().value(), "user0-user1", STARTING_TIME.plusSeconds(2), "2 Visible only to user0 and user1");
        testDbHelper.insertCustomMessage(3, users[1].getName().value(), "user1-user2", STARTING_TIME.plusSeconds(4), "3 Visible only to user1 and user2");
        testDbHelper.insertCustomMessage(4, users[2].getName().value(), "user0-user2", STARTING_TIME.plusSeconds(6), "4 Visible only to user0 and user2");
        testDbHelper.insertCustomMessage(5, users[0].getName().value(), "user0-user1", STARTING_TIME.plusSeconds(8), "5 Visible only to user0 and user1");
    }

    @Test
    void whenFetching_withoutPageSize_responseIsOfAllRooms_thatContainName() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?nameToSearch=user");

        Assertions.assertEquals(5, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("user1-user3", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("user1-user4", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("user1-user5", responseBody.getData().get(4).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize3_responseIsOf3Rooms_theExpectedOnes() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?page[size]=3&nameToSearch=user");

        Assertions.assertEquals(3, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("user1-user3", responseBody.getData().get(2).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_afterSecondRoom_responseIsOfTheExpectedRooms() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?page[after]=[t]%s&nameToSearch=user".formatted(STARTING_TIME.plusSeconds(3)));

        Assertions.assertEquals(3, responseBody.getData().size());

        Assertions.assertEquals("user1-user3", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user4", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("user1-user5", responseBody.getData().get(2).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_beforeSecondToLastRoom_responseIsOfTheExpectedRooms() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?page[before]=[u]%s&nameToSearch=u".formatted(users[4].getDescription()));

        Assertions.assertEquals(6, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("user1-user3", responseBody.getData().get(5).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize1_beforeSecondToLastRoom_responseIsOfTheExpectedRoom() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?page[size]=1&page[before]=[r]%s&nameToSearch=ub".formatted(public4.getDescription()));

        Assertions.assertEquals(1, responseBody.getData().size());

        Assertions.assertEquals("public3", responseBody.getData().get(0).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_linksAreEmpty() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?nameToSearch=user");

        PaginationLinksDto links = responseBody.getLinks();

        System.out.println(links);

        Assertions.assertTrue(links.getPrev().isEmpty());
        Assertions.assertTrue(links.getNext().isEmpty());
    }

    @Test
    void whenFetching_withPageSize3_linksAreAsExpected() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?page[size]=3&nameToSearch=user");

        PaginationLinksDto links = responseBody.getLinks();

        Assertions.assertEquals("/api/rooms/search?page[size]=3&page[before]=[t]%s&nameToSearch=user".formatted(STARTING_TIME.plusSeconds(8)), links.getPrev());
        Assertions.assertEquals("/api/rooms/search?page[size]=3&page[after]=[u]%s&nameToSearch=user".formatted(users[3].getDescription()), links.getNext());
    }

    @Test
    void whenFetching_withPageSize1_beforeSecondToLastRoom_linksAreAsExpected() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms/search?page[size]=1&page[before]=[r]%s&nameToSearch=ub".formatted(public4.getDescription()));

        PaginationLinksDto links = responseBody.getLinks();

        Assertions.assertEquals("/api/rooms/search?page[size]=1&page[before]=[r]%s&nameToSearch=ub".formatted(public3.getDescription()), links.getPrev());
        Assertions.assertEquals("/api/rooms/search?page[size]=1&page[after]=[r]%s&nameToSearch=ub".formatted(public3.getDescription()), links.getNext());
    }
}
