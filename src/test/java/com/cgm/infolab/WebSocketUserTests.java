package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.db.repository.RowMappers;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.cgm.infolab.templates.WebSocketTestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;

import java.lang.reflect.Type;
import java.util.concurrent.*;

import static org.awaitility.Awaitility.await;

public class WebSocketUserTests extends WebSocketTestTemplate {

    @Autowired
    public JdbcTemplate jdbcTemplate;
    @Autowired
    public RowMappers rowMappers;

    @Override
    @BeforeAll
    protected void setUpAll() {
        super.setUpAll();

        testDbHelper.addRooms(RoomEntity.general());
    }

    @AfterEach
    void tearDown() {
        testDbHelper.clearDbExceptForGeneral();
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
