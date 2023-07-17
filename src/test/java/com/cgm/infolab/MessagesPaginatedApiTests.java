package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.LinkedHashMap;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MessagesPaginatedApiTests {
    
    @Autowired
    TestDbHelper testDbHelper;
    @Autowired
    ChatService chatService;
    @Autowired
    TestRestTemplate testRestTemplate;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public ChatMessageDto[] messageDtos = new ChatMessageDto[80];

    @BeforeAll
    void setUp() {
        testDbHelper.clearDbExceptForRooms();

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        for (int i = 0; i < messageDtos.length; i++) {
            messageDtos[i] = ChatMessageDto.of("%d. Hello general from user0".formatted(i), loggedInUser.getName().value());
            chatService.saveMessageInDb(messageDtos[i], loggedInUser.getName(), general.getName(), null);
        }
    }

    @Test
    void whenFetching_withoutPageSize_responseIsOfAllMessages() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(80, responseBody.size());
    }

    @Test
    void whenFetching_withPageSize10_responseIsLast10Messages() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[size]=10",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(10, responseBody.size());

        Assertions.assertEquals("79. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("70. Hello general from user0", responseBody.get(9).get("content"));
    }
}
