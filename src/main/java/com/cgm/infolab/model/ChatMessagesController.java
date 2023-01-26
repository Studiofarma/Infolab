package com.cgm.infolab.model;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChatMessagesController {



    @GetMapping("/api/messages")
    public List<ChatMessage> getAllMessages() {
        ChatMessage message = new ChatMessage();
        message.setContent("ciao");
        message.setSender("luca");
        ChatMessage message2 = new ChatMessage();
        message2.setContent("ciao2");
        message2.setSender("luca2");
        return List.of(message, message2);
    }

}
