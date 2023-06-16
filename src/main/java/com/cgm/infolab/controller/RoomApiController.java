package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.FromEntitiesToDtosService;
import com.cgm.infolab.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
public class RoomApiController {
    private final RoomService roomService;
    private final FromEntitiesToDtosService fromEntitiesToDtosService;
    private final Logger log = LoggerFactory.getLogger(RoomApiController.class);


    @Autowired
    public RoomApiController(RoomService roomService, FromEntitiesToDtosService fromEntitiesToDtosService) {
        this.roomService = roomService;
        this.fromEntitiesToDtosService = fromEntitiesToDtosService;
    }

    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false) String date, Principal principal) {

        List<RoomDto> roomDtos = new ArrayList<>();
        List<RoomEntity> roomEntities = roomService.getRooms(date, Username.of(principal.getName()));


        if (roomEntities.size() > 0) {

            roomDtos = roomEntities.stream().map(fromEntitiesToDtosService::fromEntityToDto).toList();
        } else {
            log.info("Non sono state trovate room");
        }
        return roomDtos;
    }

    /**
     * @param username è l'utente con cui il principal inizia una conversazione privata
     */
    @PostMapping("/api/rooms/{username}")
    public void postPrivateRoom(@PathVariable("username") String username, Principal principal){
        roomService.createPrivateRoomAndSubscribeUsers(Username.of(username), Username.of(principal.getName()));
    }
}
