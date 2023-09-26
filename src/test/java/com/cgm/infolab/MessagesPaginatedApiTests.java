package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.templates.BasicApiTest;
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
import java.util.LinkedHashMap;
import java.util.List;

public class MessagesPaginatedApiTests extends BasicApiTest {

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};
    public ChatMessageDto[] messageDtos = new ChatMessageDto[80];

    public RoomEntity general = RoomEntity.general();

    public static final LocalDateTime STARTING_TIME = LocalDateTime.of(2023, 6, 1, 1, 1, 1, 1000000);

    @Override
    @BeforeAll
    protected void setUp() {
        super.setUp();

        testDbHelper.addRooms(RoomEntity.general());

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        for (int i = 0; i < messageDtos.length; i++) {
            testDbHelper.insertCustomMessage(i, users[0].getName().value(), general.getName().value(), STARTING_TIME.plusSeconds(i), "%d. Hello general from user0".formatted(i));
        }
    }

    @Test
    void whenFetching_withoutPageSize_responseIsOfAllMessages() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/messages/general");

        Assertions.assertEquals(80, responseBody.size());
    }

    @Test
    void whenFetching_withPageSize3_responseIsLast3Messages() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/messages/general?page[size]=3");

        Assertions.assertEquals(3, responseBody.size());

        Assertions.assertEquals("79. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("78. Hello general from user0", responseBody.get(1).get("content"));
        Assertions.assertEquals("77. Hello general from user0", responseBody.get(2).get("content"));
    }

    @Test
    void whenFetching_withoutPageSize_afterMessage30_messagesFrom79To31AreReturned() {
        LocalDateTime stringDate = getMessageTimestamp(30);

        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/messages/general?page[after]=%s".formatted(stringDate));

        Assertions.assertEquals(49, responseBody.size());

        for (int i = 0, c = 79; i < responseBody.size(); i++, c--) {
            Assertions.assertEquals("%d. Hello general from user0".formatted(c), responseBody.get(i).get("content"));
        }
    }

    @Test
    void whenFetching_withoutPageSize_beforeMessage30_messagesFrom29To0AreReturned() {
        LocalDateTime stringDate = getMessageTimestamp(30);

        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/messages/general?page[before]=%s".formatted(stringDate));

        for (int i = 0, c = 29; i < responseBody.size(); i++, c--) {
            Assertions.assertEquals("%d. Hello general from user0".formatted(c), responseBody.get(i).get("content"));
        }
    }

    @Test
    void whenFetching_pageSize3_afterMessage50_messagesFrom53To51AreReturned() {
        LocalDateTime stringDate = getMessageTimestamp(50);

        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/messages/general?page[size]=3&page[after]=%s".formatted(stringDate));

        Assertions.assertEquals(3, responseBody.size());
        Assertions.assertEquals("53. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("52. Hello general from user0", responseBody.get(1).get("content"));
        Assertions.assertEquals("51. Hello general from user0", responseBody.get(2).get("content"));
    }

    @Test
    void whenFetching_pageSize3_beforeMessage50_messagesFrom49To47AreReturned() {
        LocalDateTime stringDate = getMessageTimestamp(50);

        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/messages/general?page[size]=3&page[before]=%s".formatted(stringDate));

        Assertions.assertEquals(3, responseBody.size());
        Assertions.assertEquals("49. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("48. Hello general from user0", responseBody.get(1).get("content"));
        Assertions.assertEquals("47. Hello general from user0", responseBody.get(2).get("content"));
    }

    @Test
    void whenTryingToUseRangePagination_badRequestStatusCodeIsReturned() {
        LocalDateTime stringDateBefore = getMessageTimestamp(30);
        LocalDateTime stringDateAfter = getMessageTimestamp(50);

        ResponseEntity<Object> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[before]=%s&page[after]=%s".formatted(stringDateBefore, stringDateAfter),
                Object.class);

        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void whenTryingToSetPageSizeOutsideOfPermittedRange_badRequestCodeIsReturned() {
        ResponseEntity<Object> response1 = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[size]=0",
                Object.class);

        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response1.getStatusCode());

        ResponseEntity<Object> response2 = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[size]=60",
                Object.class);

        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response2.getStatusCode());
    }

    private LocalDateTime getMessageTimestamp(int messageNumber) {
        return STARTING_TIME.plusSeconds(messageNumber);
    }
}
