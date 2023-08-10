package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.RoomOrUserAsRoomEnum;
import com.cgm.infolab.model.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

public abstract class FromEntitiesToDtosMapper {

    public static ChatMessageDto fromEntityToChatMessageDto(ChatMessageEntity messageEntity) {
        String status = messageEntity.getStatus() != null ? messageEntity.getStatus().toString() : null;

        return ChatMessageDto.of(
                messageEntity.getId(),
                messageEntity.getContent(),
                messageEntity.getTimestamp(),
                messageEntity.getSender().getName().value(),
                messageEntity.getRoom().getName().value(),
                status
        );
    }

    public static LastMessageDto fromEntityToLastMessageDto(ChatMessageEntity messageEntity) {
        String status = messageEntity.getStatus() != null ? messageEntity.getStatus().toString() : null;

        return LastMessageDto.of(
                messageEntity.getContent(),
                messageEntity.getTimestamp(),
                fromEntityToDto(messageEntity.getSender()),
                status
        );
    }

    public static RoomDto fromEntityToDto2(RoomEntity roomEntity, String principalName) {
        String roomName =
                roomEntity.getRoomOrUser().equals(RoomOrUserAsRoomEnum.USER_AS_ROOM)
                        ? RoomName.of(Username.of(roomEntity.getName().value()), Username.of(principalName)).value()
                        : roomEntity.getName().value();

        RoomDto roomDto = RoomDto.of(
                roomName,
                roomEntity.getNotDownloadedMessagesCount(),
                roomEntity.getLastDownloadedDate(),
                roomEntity.getDescription(),
                roomEntity.getVisibility().toString(),
                roomEntity.getRoomType().toString(),
                roomEntity.getRoomOrUser()
        );

        LastMessageDto lastMessage = fromEntityToLastMessageDto(roomEntity.getMessages().get(0));
        roomDto.setLastMessage(lastMessage);

        List<UserDto> userDtos = roomEntity.getOtherParticipants().stream().map(FromEntitiesToDtosMapper::fromEntityToDto).toList();
        roomDto.setOtherParticipants(userDtos);

        return roomDto;
    }


    public static UserDto fromEntityToDto(UserEntity userEntity) {
        return UserDto.of(userEntity.getName().value(), userEntity.getId(), userEntity.getDescription());
    }

    public static BasicJsonDto<RoomDto> fromEntityToDto2(String prev, String next, List<RoomEntity> roomEntities, String principalName) {
        PaginationLinksDto linksDto = PaginationLinksDto.of(prev, next);

        List<RoomDto> roomDtos = new ArrayList<>();

        roomEntities.forEach(roomEntity -> roomDtos.add(fromEntityToDto2(roomEntity, principalName)));

        return BasicJsonDto.of(linksDto, roomDtos);
    }
}
