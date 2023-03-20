package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class RoomApiController {
    private final RoomService roomService;

    @Autowired
    public RoomApiController(RoomService roomService) {
        this.roomService = roomService;
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
        roomService.createPrivateRoomAndSubscribeUsers(Username.of(username), Username.of(principal.getName()));
    }
}
