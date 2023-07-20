package com.cgm.infolab.controller.api;

import com.cgm.infolab.db.model.enums.Username;
import com.cgm.infolab.model.IdDto;
import com.cgm.infolab.service.ChatService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
public class CommandsApiController {

    private final ChatService chatService;

    public CommandsApiController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/api/commands/lastread")
    public void postLastReadDates(@RequestBody List<IdDto> messageIds, Principal principal) {
        chatService.addReadTimestampForMessages(Username.of(principal.getName()), messageIds);
    }
}
