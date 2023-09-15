package com.cgm.infolab;

import com.cgm.infolab.configuration.TestSecurityConfiguration;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.db.repository.RowMappers;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.helper.TestStompHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.concurrent.*;

import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({ProfilesConstants.TEST})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class WebsocketUserTest {
    @LocalServerPort
    public Integer port;
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public TestStompHelper testStompHelper;
    @Autowired
    public JdbcTemplate jdbcTemplate;
    @Autowired
    public RowMappers rowMappers;

    WebSocketStompClient websocket;

    UserEntity user1 = UserEntity.of(Username.of("user1"));

    // This is here because the @Import annotation does not work
    @TestConfiguration
    public static class SecurityConfiguration extends TestSecurityConfiguration {}

    @BeforeAll
    public void setupAll() {
        testDbHelper.clearDbExceptForGeneral();

        websocket = testStompHelper.initWebsocket();
    }

    @AfterEach
    void tearDown() {
        testDbHelper.clearDbExceptForGeneral();
    }

    @Test
    void whenUserFirstLogs_andSendsMessageToRegisterEndpoint_heIsSavedInDb() throws ExecutionException, InterruptedException, TimeoutException {

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        // Check that user does not exist before
        Assertions.assertThrows(EmptyResultDataAccessException.class, () -> {
            UserEntity user = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = 'user1'", rowMappers::mapToUserEntity);
        });

        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        WebSocketMessageDto joinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(null, Username.of("user1").value()));
        client.send("/app/chat.register", joinMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    UserEntity user1FromDb = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = 'user1'", rowMappers::mapToUserEntity);

                    Assertions.assertEquals("user1", user1FromDb.getName().value());
                    Assertions.assertEquals("user1", user1FromDb.getDescription());
                    Assertions.assertEquals(UserStatusEnum.ONLINE, user1FromDb.getStatus());

                    Assertions.assertEquals(joinMessage, receivedMessages.poll());
                });
    }

    @Test
    void whenUserLogs_andSendsMessageToRegisterEndpoint_andIsAlreadySavedInDb_statusBecomesOnline() throws ExecutionException, InterruptedException, TimeoutException {

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        testDbHelper.addUsers(user1);

        UserEntity user1Before = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = 'user1'", rowMappers::mapToUserEntity);

        Assertions.assertEquals(UserStatusEnum.OFFLINE, user1Before.getStatus());

        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        WebSocketMessageDto joinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(null, Username.of("user1").value()));
        client.send("/app/chat.register", joinMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    UserEntity user1FromDb = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = 'user1'", rowMappers::mapToUserEntity);

                    Assertions.assertEquals("user1", user1FromDb.getName().value());
                    Assertions.assertEquals("user1", user1FromDb.getDescription());
                    Assertions.assertEquals(UserStatusEnum.ONLINE, user1FromDb.getStatus());

                    Assertions.assertEquals(joinMessage, receivedMessages.poll());
                });
    }

    @Test
    void whenUserLogsOut_andSendsMessageToUnregisterEndpoint_statusBecomesOffline() throws ExecutionException, InterruptedException, TimeoutException {
        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        UserEntity user1Online = UserEntity.of(user1.getName(), user1.getDescription(), UserStatusEnum.ONLINE);

        testDbHelper.addUsers(user1Online);

        UserEntity user1Before = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = 'user1'", rowMappers::mapToUserEntity);

        Assertions.assertEquals(UserStatusEnum.ONLINE, user1Before.getStatus());

        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        WebSocketMessageDto quitMessage = WebSocketMessageDto.ofQuit(ChatMessageDto.of(null, Username.of("user1").value()));
        client.send("/app/chat.unregister", quitMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    UserEntity user1FromDb = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = 'user1'", rowMappers::mapToUserEntity);

                    Assertions.assertEquals("user1", user1FromDb.getName().value());
                    Assertions.assertEquals("user1", user1FromDb.getDescription());
                    Assertions.assertEquals(UserStatusEnum.OFFLINE, user1FromDb.getStatus());

                    Assertions.assertEquals(quitMessage, receivedMessages.poll());
                });
    }
}
