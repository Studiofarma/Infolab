package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.RoomService;
import com.cgm.infolab.service.RoomSubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class RoomApiController {
    private final RoomService roomService;
    private final RoomSubscriptionService roomSubscriptionService;

    @Autowired
    public RoomApiController(RoomService roomService, RoomSubscriptionService roomSubscriptionService) {
        this.roomService = roomService;
        this.roomSubscriptionService = roomSubscriptionService;
    }

    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false) String date, Principal principal) {
        return roomService.getRooms(date, Username.of(principal.getName()));
    }

    /**
     * @param username è l'utente con cui il principal inizia una conversazione privata
     */
    @PostMapping("/api/rooms/{username}")
    public void postPrivateRoom(@PathVariable("username") String username, Principal principal){
        RoomEntity room = roomService.createPrivateRoom(Username.of(username), Username.of(principal.getName()));
        roomSubscriptionService.subscribeUsersToRoom(room.getName(), username, principal.getName());
    }
}
