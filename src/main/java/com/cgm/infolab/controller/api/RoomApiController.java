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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
                                              @RequestParam(required = false, name = PAGE_AFTER_API_NAME) String pageAfter,
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

    /**
     * The format with which you can point out the type of the cursor is this:
     * {t} for timestamp
     * {r} for room's description
     * {u} for user's description
     * It must be at the beginning of the string without any character (or whitespace) before or after.
     * Example: page[after]={dr}Mario Rossi
     */
    private Object parseCursor(String cursor) throws IllegalArgumentException {
        
        char typeIdentifier = cursor.charAt(1);
        String query = cursor.substring(4);

        return switch (typeIdentifier) {
            case 't' -> fromStringToDateTime(query);
            case 'r' -> query;
            case 'u' -> query;
            default -> throw new IllegalArgumentException("The type identifier in the provided string is not valid.");
        };
    }

    // TODO: put this in a helper class
    private LocalDateTime fromStringToDateTime(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return LocalDateTime.parse(date, formatter);
        }
    }
}
