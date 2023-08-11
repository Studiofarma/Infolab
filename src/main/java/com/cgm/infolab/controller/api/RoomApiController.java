package com.cgm.infolab.controller.api;

import com.cgm.infolab.controller.FromEntitiesToDtosMapper;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.RoomOrUserAsRoomEnum;
import com.cgm.infolab.helper.DateTimeHelper;
import com.cgm.infolab.model.BasicJsonDto;
import com.cgm.infolab.model.RoomCursor;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.RoomService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

import static com.cgm.infolab.controller.api.ApiConstants.*;

@RestController
@Validated
public class RoomApiController {
    private final RoomService roomService;
    private final ApiHelper apiHelper;
    private final Logger log = LoggerFactory.getLogger(RoomApiController.class);


    private static final String ROOMS_PATH = "/api/rooms";


    @Autowired
    public RoomApiController(RoomService roomService, ApiHelper apiHelper) {
        this.roomService = roomService;
        this.apiHelper = apiHelper;
    }

    @GetMapping(ROOMS_PATH)
    public BasicJsonDto<RoomDto> getAllRooms(@RequestParam(required = false, name = PAGE_SIZE_API_NAME) @Min(1) @Max(15) Integer pageSize,
                                             @RequestParam(required = false, name = PAGE_BEFORE_API_NAME) String pageBefore,
                                             @RequestParam(required = false, name = PAGE_AFTER_API_NAME) String pageAfter,
                                             Principal principal) {

        if (pageBefore != null && pageAfter != null) {
            apiHelper.throwOnRangePagination();
        }

        if (pageSize == null) pageSize = -1;

        RoomCursor cursorAfter;
        RoomCursor cursorBefore;
        try {
            cursorAfter = pageAfter != null ? parseCursor(pageAfter) : null;
            cursorBefore = pageBefore != null ? parseCursor(pageBefore) : null;
        } catch (IllegalArgumentException e) {
            log.error(e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        BasicJsonDto<RoomDto> roomDtos = BasicJsonDto.empty();
        List<RoomEntity> roomEntities = roomService.getRoomsAndUsers(pageSize, cursorBefore, cursorAfter, Username.of(principal.getName()));

        if (!roomEntities.isEmpty()) {
            String prev = getLinkForRooms(ROOMS_PATH, roomEntities, pageSize, PAGE_BEFORE_API_NAME);
            String next = getLinkForRooms(ROOMS_PATH, roomEntities, pageSize, PAGE_AFTER_API_NAME);

            roomDtos = FromEntitiesToDtosMapper.fromEntityToDto(prev, next, roomEntities, principal.getName());
        } else {
            log.info("Non sono state trovate room");
        }
        return roomDtos;
    }

    @GetMapping(ROOMS_PATH + "/search")
    public BasicJsonDto<RoomDto> searchRooms(@RequestParam(required = false, name = PAGE_SIZE_API_NAME) @Min(1) @Max(15) Integer pageSize,
                                             @RequestParam(required = false, name = PAGE_BEFORE_API_NAME) String pageBefore,
                                             @RequestParam(required = false, name = PAGE_AFTER_API_NAME) String pageAfter,
                                             @RequestParam String nameToSearch,
                                             Principal principal) {

        if (pageBefore != null && pageAfter != null) {
            apiHelper.throwOnRangePagination();
        }

        if (pageSize == null) pageSize = -1;

        RoomCursor cursorAfter;
        RoomCursor cursorBefore;
        try {
            cursorAfter = pageAfter != null ? parseCursor(pageAfter) : null;
            cursorBefore = pageBefore != null ? parseCursor(pageBefore) : null;
        } catch (IllegalArgumentException e) {
            log.error(e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        BasicJsonDto<RoomDto> roomDtos = BasicJsonDto.empty();
        List<RoomEntity> roomEntities = roomService.searchRoomsAndUsers(pageSize, cursorBefore, cursorAfter, nameToSearch, Username.of(principal.getName()));

        if (!roomEntities.isEmpty()) {
            String prev = getLinkForRoomsWithName(ROOMS_PATH + "/search", roomEntities, pageSize, PAGE_BEFORE_API_NAME, nameToSearch);
            String next = getLinkForRoomsWithName(ROOMS_PATH + "/search", roomEntities, pageSize, PAGE_AFTER_API_NAME, nameToSearch);

            roomDtos = FromEntitiesToDtosMapper.fromEntityToDto(prev, next, roomEntities, principal.getName());
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
     * [t] for timestamp
     * [r] for room's description
     * [u] for user's description
     * It must be at the beginning of the string without any character (or whitespace) before or after.
     * Example: page[after]={dr}Mario Rossi
     */
    private RoomCursor parseCursor(String cursor) throws IllegalArgumentException {
        char typeIdentifier = cursor.charAt(1);
        String query = cursor.substring(3);

        return switch (typeIdentifier) {
            case 't' -> RoomCursor.ofTimestamp(DateTimeHelper.fromStringToDateTimeWithT(query));
            case 'r' -> RoomCursor.ofDescriptionRoom(query);
            case 'u' -> RoomCursor.ofDescriptionUser(query);
            default -> throw new IllegalArgumentException("The type identifier in the provided string is not valid.");
        };
    }

    private String getLinkForRooms(String path, List<RoomEntity> result, int pageSize, String beforeOrAfterName) throws IllegalArgumentException {

        if (pageSize <= 0) return "";

        String pageSizeQuery = "%s=%d&".formatted(PAGE_SIZE_API_NAME, pageSize);

        RoomEntity roomEntity;

        if (beforeOrAfterName.equals(PAGE_BEFORE_API_NAME))
            roomEntity = result.get(0);
        else if (beforeOrAfterName.equals(PAGE_AFTER_API_NAME))
            roomEntity = result.get(result.size() - 1);
        else
            throw new IllegalArgumentException("Invalid api name.");

        return calculateQuery(path, beforeOrAfterName, pageSizeQuery, roomEntity);
    }

    private String getLinkForRoomsWithName(String path, List<RoomEntity> result, int pageSize, String beforeOrAfterName, String nameToSearch) {
        if (pageSize <= 0) return "";

        return getLinkForRooms(path, result, pageSize, beforeOrAfterName) + "&nameToSearch=%s".formatted(nameToSearch);
    }

    private String calculateQuery(String path, String beforeOrAfterName, String pageSizeQuery, RoomEntity roomEntity) {
        String query = path + "?" + pageSizeQuery;

        if (roomEntity.getRoomOrUser().equals(RoomOrUserAsRoomEnum.ROOM)) {
            if (roomEntity.getMessages().get(0).getTimestamp() != null) {
                query += beforeOrAfterName + "=[t]" + roomEntity.getMessages().get(0).getTimestamp();
            } else {
                query += beforeOrAfterName + "=[r]" + roomEntity.getDescription();
            }
        } else {
            query += beforeOrAfterName + "=[u]" + roomEntity.getDescription();
        }
        return query;
    }
}
