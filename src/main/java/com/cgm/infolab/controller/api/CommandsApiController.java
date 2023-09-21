package com.cgm.infolab.controller.api;

import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.IdDto;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
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
    private final ApiHelper apiHelper;

    private final Logger log = LoggerFactory.getLogger(CommandsApiController.class);

    public CommandsApiController(ChatService chatService, UserService userService, ApiHelper apiHelper) {
        this.chatService = chatService;
        this.userService = userService;
        this.apiHelper = apiHelper;
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
        try {
            userService.saveUserInDb(Username.of(principal.getName()), description);
        } catch (DuplicateKeyException e) {
            log.error("User with username=%s already exists in database.".formatted(principal.getName()));
            apiHelper.throwBadRequestStatus("User with username=%s already exists in database.".formatted(principal.getName()));
        }
    }
}
