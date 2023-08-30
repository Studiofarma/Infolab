package com.cgm.infolab.controller.api;

import com.cgm.infolab.model.MyWebSocketHandler;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SubProtocolWebSocketHandler;

@RestController
public class InternalApiController {

    private final MyWebSocketHandler myWebSocketHandler;

    public InternalApiController(SubProtocolWebSocketHandler myWebSocketHandler) {
        this.myWebSocketHandler = (MyWebSocketHandler) myWebSocketHandler;
    }

    @PutMapping("/internal/ping")
    public void pingAllWebSocketSessions() {
        myWebSocketHandler.pingEachSession();
    }
}
