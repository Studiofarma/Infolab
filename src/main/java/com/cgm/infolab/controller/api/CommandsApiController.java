package com.cgm.infolab.controller.api;

import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.IdDto;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
public class CommandsApiController {

    private final ChatService chatService;
    private final UserService userService;

    public CommandsApiController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @PostMapping(value = "/api/commands/lastread", consumes = {"application/json"})
    public void postLastReadDates(@RequestBody List<IdDto> messageIds, Principal principal) {
        chatService.addReadTimestampForMessages(Username.of(principal.getName()), messageIds);
    }

    @PostMapping("/api/commands/readall")
    public void postReadAll(@RequestParam String roomName, Principal principal) {
        chatService.updateReadTimestamp(Username.of(principal.getName()), RoomName.of(roomName));
    }

    @PostMapping("/api/commands/createuser")
    public void postCreateUser(@RequestParam String description, Principal principal) {
        userService.createUser(Username.of(principal.getName()), description);
    }
}
