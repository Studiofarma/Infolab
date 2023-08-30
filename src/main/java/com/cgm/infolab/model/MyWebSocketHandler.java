package com.cgm.infolab.model;

import org.apache.tomcat.websocket.WsSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.SubscribableChannel;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.messaging.SubProtocolWebSocketHandler;
import org.springframework.web.socket.sockjs.transport.session.WebSocketServerSockJsSession;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.concurrent.ConcurrentHashMap;

public class MyWebSocketHandler extends SubProtocolWebSocketHandler {

    private final Logger log = LoggerFactory.getLogger(MyWebSocketHandler.class);

    private ConcurrentHashMap<String, WebSocketSession> sessionsMap = new ConcurrentHashMap<>();

    public MyWebSocketHandler(MessageChannel clientInboundChannel, SubscribableChannel clientOutboundChannel) {
        super(clientInboundChannel, clientOutboundChannel);
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
        sessionsMap.put(session.getId(), session);
        log.info("Connection established with session id=%s".formatted(session.getId()));
        log.info(session.getClass().toString()); // WebSocketServerSockJsSession
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus closeStatus) throws Exception {
        super.afterConnectionClosed(session, closeStatus);
        sessionsMap.remove(session.getId());
        log.info("Connection closed with session id=%s".formatted(session.getId()));
    }

    public void pingEachSession() {
        sessionsMap.forEach((key, session) -> {
            try {
                WebSocketServerSockJsSession sockJsSession = (WebSocketServerSockJsSession) session;

                WsSession nativeSession = sockJsSession.getNativeSession(WsSession.class);

                nativeSession.getAsyncRemote().sendPing(ByteBuffer.wrap(new byte[0]));
            } catch (IOException e) {
                log.error("Error while sending ping message to session with sessionId=%s".formatted(key));
                throw new RuntimeException(e);
            }
        });
    }
}
