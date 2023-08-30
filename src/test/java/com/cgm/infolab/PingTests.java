package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.helper.TestStompHelper;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.*;

import static org.awaitility.Awaitility.await;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
public class PingTests {
    @LocalServerPort
    public Integer port;
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public TestStompHelper testStompHelper;
    @Autowired
    TestApiHelper testApiHelper;
    @Autowired
    MockMvc mvc;

    WebSocketStompClient websocket;
    UserEntity user1 = UserEntity.of(Username.of("user1"));

    @BeforeAll
    public void setupAll() {
        testDbHelper.clearDbExceptForGeneral();

        testDbHelper.addUsers(user1);

        websocket = testStompHelper.initWebsocket();
    }

    @Test
    void whenCallingPingApi_currentSessionIsPinged() throws Exception {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/app", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return Object.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        putToApiForUser1("/internal/ping");

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    System.out.println(receivedMessages.poll());
                });
    }

    private void putToApiForUser1(String url) throws Exception {
        mvc.perform(
                put(url)
                        .with(csrf().asHeader())
                        .with(user("user1").password("password1"))
        ).andExpect(status().isOk());
    }
}
