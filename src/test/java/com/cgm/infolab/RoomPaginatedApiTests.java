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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
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
                    ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value())
            };

    public RoomEntity general = RoomEntity.general();
    public RoomEntity public2 = RoomEntity.of(RoomName.of("public2"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 2 desc");
    public RoomEntity public3 = RoomEntity.of(RoomName.of("public3"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 3 desc");
    public RoomEntity public4 = RoomEntity.of(RoomName.of("public4"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Public room 4 desc");
    public static final LocalDateTime STARTING_TIME = LocalDateTime.of(2023, 6, 1, 1, 1, 1);


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
    void whenFetching_withoutPageSize_responseIsOfAllRooms() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2");
        responseBody
                .getData()
                .stream()
                .sorted(Comparator.comparing(linkedHashMap -> linkedHashMap.get("roomName").toString()))
                .toList();

        responseBody.getData().forEach(System.out::println);

        Assertions.assertEquals(9, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(5).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(6).get("roomName"));
        Assertions.assertEquals("user4", responseBody.getData().get(7).get("roomName"));
        Assertions.assertEquals("user5", responseBody.getData().get(8).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize2_responseIsOf2FirstRooms() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=2");

        Assertions.assertEquals(2, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize7_responseIsOf7FirstRooms() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=7");

        Assertions.assertEquals(7, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(5).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(6).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_afterSecondRoom_byUsingDate_last7RoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[after]=[t]%s".formatted(STARTING_TIME.plusSeconds(3)));

        Assertions.assertEquals(7, responseBody.getData().size());

        Assertions.assertEquals("general", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("user4", responseBody.getData().get(5).get("roomName"));
        Assertions.assertEquals("user5", responseBody.getData().get(6).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_afterFirstRoom_byUsingDate_last8RoomsAreReturned_inCorrectOrder() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[after]=[t]%s".formatted(STARTING_TIME.plusSeconds(7)));

        Assertions.assertEquals(8, responseBody.getData().size());

        Assertions.assertEquals("user1-user2", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(5).get("roomName"));
        Assertions.assertEquals("user4", responseBody.getData().get(6).get("roomName"));
        Assertions.assertEquals("user5", responseBody.getData().get(7).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize3_afterFirstRoom_byUsingDate_expectedRoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=3&page[after]=[t]%s".formatted(STARTING_TIME.plusSeconds(7)));

        Assertions.assertEquals(3, responseBody.getData().size());

        Assertions.assertEquals("user1-user2", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(2).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_afterThirdRoom_byUsingDescriptionRoom_last6RoomsAreReturned_inCorrectOrder() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[after]=[r]Generale");

        Assertions.assertEquals(6, responseBody.getData().size());

        Assertions.assertEquals("public2", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("user4", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("user5", responseBody.getData().get(5).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize4_afterThirdRoom_byUsingDescriptionRoom_expectedRoomsAreReturned_inCorrectOrder() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=4&page[after]=[r]Generale");

        Assertions.assertEquals(4, responseBody.getData().size());

        Assertions.assertEquals("public2", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(3).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_afterSeventhRoom_byUsingDescriptionUser_last2RoomsAreReturned_inCorrectOrder() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[after]=[u]user3 desc");

        Assertions.assertEquals(2, responseBody.getData().size());

        Assertions.assertEquals("user4", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user5", responseBody.getData().get(1).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize1_afterSeventhRoom_byUsingDescriptionUser_expectedRoomIsReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=1&page[after]=[u]user3 desc");

        Assertions.assertEquals(1, responseBody.getData().size());

        Assertions.assertEquals("user4", responseBody.getData().get(0).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_beforeSecondToLastRoom_byUsingDescriptionUser_first7RoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[before]=[u]user4 desc");

        responseBody.getData().forEach(System.out::println);

        Assertions.assertEquals(7, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(5).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(6).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize6_beforeSecondToLastRoom_byUsingDescriptionUser_expectedRoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=6&page[before]=[u]user4 desc");

        responseBody.getData().forEach(System.out::println);

        Assertions.assertEquals(6, responseBody.getData().size());

        Assertions.assertEquals("user1-user2", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public4", responseBody.getData().get(4).get("roomName"));
        Assertions.assertEquals("user3", responseBody.getData().get(5).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_beforeFourthToLastRoom_byUsingDescriptionRoom_first5RoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[before]=[r]Public room 4 desc");

        Assertions.assertEquals(5, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
        Assertions.assertEquals("general", responseBody.getData().get(2).get("roomName"));
        Assertions.assertEquals("public2", responseBody.getData().get(3).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(4).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize2_beforeFourthToLastRoom_byUsingDescriptionRoom_expectedRoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=2&page[before]=[r]Public room 4 desc");

        Assertions.assertEquals(2, responseBody.getData().size());

        Assertions.assertEquals("public2", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("public3", responseBody.getData().get(1).get("roomName"));
    }

    @Test
    void whenFetching_withoutPageSize_beforeThirdRoom_byUsingTimestamp_first2RoomsAreReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[before]=[t]%s".formatted(STARTING_TIME.plusSeconds(1)));

        Assertions.assertEquals(2, responseBody.getData().size());

        Assertions.assertEquals("user0-user1", responseBody.getData().get(0).get("roomName"));
        Assertions.assertEquals("user1-user2", responseBody.getData().get(1).get("roomName"));
    }

    @Test
    void whenFetching_withPageSize1_beforeThirdRoom_byUsingTimestamp_expectedRoomIsReturned() {
        BasicJsonDto<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1WithJsonDto("/api/rooms2?page[size]=1&page[before]=[t]%s".formatted(STARTING_TIME.plusSeconds(1)));

        Assertions.assertEquals(1, responseBody.getData().size());

        Assertions.assertEquals("user1-user2", responseBody.getData().get(0).get("roomName"));
    }

    @Test
    void whenFetching_ifTypeIdentifierProvidedIsInvalid_badRequestIsThrown() {
        ResponseEntity<BasicJsonDto> response = testRestTemplate
                .withBasicAuth("user1", "password1")
                .getForEntity("/api/rooms2?page[after]=%s".formatted(STARTING_TIME), BasicJsonDto.class);

        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void whenTryingToUseRangePagination_badRequestStatusCodeIsReturned() {
        ResponseEntity<Object> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/rooms2?page[before]=[r]Hello&page[after]=[r]Hello2",
                Object.class);

        Assertions.assertEquals(response.getStatusCode(), HttpStatus.BAD_REQUEST);
    }

}
