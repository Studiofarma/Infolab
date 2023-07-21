package com.cgm.infolab;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.tomcat.util.codec.binary.Base64;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

import static com.cgm.infolab.db.model.enumeration.StatusEnum.DELETED;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.DELETE;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class WebSocketDeleteEditTests {
    @LocalServerPort
    public Integer port;
    @Autowired
    public TestRestTemplate rest;
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public ObjectMapper objectMapper;

    WebSocketStompClient websocket;

    UserEntity userBanana = UserEntity.of(Username.of("banana"));
    UserEntity user1 = UserEntity.of(Username.of("user1"));

    @BeforeAll
    public void setupAll(){
        testDbHelper.clearDbExceptForGeneral();

        websocket =
                new WebSocketStompClient(
                        new SockJsClient(
                                List.of(new WebSocketTransport(new StandardWebSocketClient()))));

        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.setObjectMapper(objectMapper);

        websocket.setMessageConverter(messageConverter);

        testDbHelper.addUsers(user1, userBanana);

        testDbHelper.addPrivateRoomsAndSubscribeUsers(List.of(Pair.of(user1, userBanana)));

        long generalId = testDbHelper.getRoomId("general");

        long bananaUser1Id = testDbHelper.getRoomId("banana-user1");

        long user1Id = testDbHelper.getUserId("user1");

        testDbHelper.insertCustomMessage(
                1,
                user1Id,
                generalId,
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "Message in general");

        testDbHelper.insertCustomMessage(
                2,
                user1Id,
                bananaUser1Id,
                LocalDateTime.of(2023, 1, 1, 1, 1, 2),
                "Message in banana-user1 room");
    }

    @Test
    void whenDeletingMessageThroughWebsocket_inRoomGeneral_deletionMessageIsReceived() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = getStompSession();

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

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

        WebSocketMessageDto webSocketDeletedMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(1));
        client.send("/app/chat.delete", webSocketDeletedMessage);

        await()
                .atMost(2, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessages.poll();

                    System.out.println(received);

                    Assertions.assertEquals(webSocketDeletedMessage.getDelete().getId(), received.getDelete().getId());
                    Assertions.assertEquals(DELETE, received.getType());
                    Assertions.assertNotNull(received.getDelete());

                    Assertions.assertNull(received.getChat());
                    Assertions.assertNull(received.getEdit());

                    ChatMessageEntity messageEntity = testDbHelper
                            .getAllMessages()
                            .stream()
                            .filter(message -> message.getId() == 1)
                            .toList()
                            .get(0);

                    Assertions.assertEquals(DELETED, messageEntity.getStatus());
                    Assertions.assertEquals("", messageEntity.getContent());
                });
    }

    private StompSession getStompSession() throws InterruptedException, ExecutionException, TimeoutException {
        String basicAuth = basicAuth(user1.getName().value(), "password1");

        ResponseEntity<MyCsrfToken> csrfResponse = rest.exchange(
                RequestEntity
                        .get("/csrf")
                        .header(HttpHeaders.AUTHORIZATION, basicAuth)
                        .build(),
                MyCsrfToken.class);

        StompHeaders stompHeaders = new StompHeaders();
        MyCsrfToken csrf = csrfResponse.getBody();
        stompHeaders.add(csrf.headerName(), csrf.token());

        WebSocketHttpHeaders headers = setCookies(csrfResponse);
        StompSession session = websocket
                .connectAsync(String.format("http://localhost:%d/chat?access_token=%s", port, encodedAuth("user1", "password1")), headers, stompHeaders, new StompSessionHandlerAdapter() {})
                .get(1, TimeUnit.SECONDS);
        return session;
    }

    private static String basicAuth(String user, String password) {
        return String.format("Basic %s", encodedAuth(user, password));
    }

    private static String encodedAuth(String user, String password) {
        return Base64.encodeBase64String(String.format("%s:%s", user, password).getBytes());
    }

    private static WebSocketHttpHeaders setCookies(ResponseEntity<MyCsrfToken> csrfResponse) {
        String cookies = csrfResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assert cookies != null;
        String sessionId = cookies.split(";")[0];
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.add(HttpHeaders.COOKIE, sessionId);
        return headers;
    }
}
