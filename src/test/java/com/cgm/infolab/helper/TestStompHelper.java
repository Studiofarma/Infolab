package com.cgm.infolab.helper;

import com.cgm.infolab.MyCsrfToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Component
public class TestStompHelper {

    private final TestRestTemplate rest;
    private final ObjectMapper objectMapper;

    public TestStompHelper(TestRestTemplate rest, ObjectMapper objectMapper) {
        this.rest = rest;
        this.objectMapper = objectMapper;
    }

    public WebSocketStompClient initWebsocket() {
        WebSocketStompClient websocket =
                new WebSocketStompClient(
                        new SockJsClient(
                                List.of(new WebSocketTransport(new StandardWebSocketClient()))));

        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.setObjectMapper(objectMapper);

        websocket.setMessageConverter(messageConverter);

        return websocket;
    }

    public StompSession getStompSessionForUser1(WebSocketStompClient websocket, Integer port) throws InterruptedException, ExecutionException, TimeoutException {
        Jwt jwt = new TestJwtHelper().generateToken("test", "user1");
        String auth = "Bearer " + jwt.getTokenValue();

        ResponseEntity<MyCsrfToken> csrfResponse = rest.exchange(
                RequestEntity
                        .get("/csrf")
                        .header(HttpHeaders.AUTHORIZATION, auth)
                        .build(),
                MyCsrfToken.class);

        StompHeaders stompHeaders = new StompHeaders();
        MyCsrfToken csrf = csrfResponse.getBody();
        stompHeaders.add(csrf.headerName(), csrf.token());

        WebSocketHttpHeaders headers = setCookies(csrfResponse);

//        StompSession session = websocket
//                .connectAsync(String.format("http://localhost:%d/chat?basic=%s", port, encodedAuth("user1", "password1")), headers, stompHeaders, new StompSessionHandlerAdapter() {})
//                .get(1, TimeUnit.SECONDS);
        StompSession session = websocket
                .connectAsync(String.format("http://localhost:%d/chat?access_token=%s", port, jwt.getTokenValue()), headers, stompHeaders, new StompSessionHandlerAdapter() {})
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
