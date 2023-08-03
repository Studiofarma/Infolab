package com.cgm.infolab.controller.api;

import com.cgm.infolab.controller.FromEntitiesToDtosMapper;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.BasicJsonDto;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import static com.cgm.infolab.controller.api.ApiConstants.PAGE_AFTER_API_NAME;
import static com.cgm.infolab.controller.api.ApiConstants.PAGE_SIZE_API_NAME;

@RestController
public class RoomApiController {
    private final RoomService roomService;
    private final Logger log = LoggerFactory.getLogger(RoomApiController.class);


    @Autowired
    public RoomApiController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/api/rooms")
    public BasicJsonDto<RoomDto> getAllRooms(@RequestParam(required = false) String date, Principal principal) {

        BasicJsonDto<RoomDto> roomDtos = BasicJsonDto.empty();
        List<RoomEntity> roomEntities = roomService.getRooms(date, Username.of(principal.getName()));


        if (!roomEntities.isEmpty()) {
            roomDtos = FromEntitiesToDtosMapper.fromEntityToDto("", "", roomEntities);
        } else {
            log.info("Non sono state trovate room");
        }
        return roomDtos;
    }

    @GetMapping("/api/rooms2")
    public BasicJsonDto<RoomDto> getAllRooms2(@RequestParam(required = false, name = PAGE_SIZE_API_NAME) Integer pageSize,
                                      Principal principal) {

        if (pageSize == null) pageSize = -1;

        BasicJsonDto<RoomDto> roomDtos = BasicJsonDto.empty();
        List<RoomEntity> roomEntities = roomService.getRoomsAndUsers(pageSize, Username.of(principal.getName()));


        if (!roomEntities.isEmpty()) {
            roomDtos = FromEntitiesToDtosMapper.fromEntityToDto("", "", roomEntities);
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
