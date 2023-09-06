package com.cgm.infolab.controller;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.RoomOrUserAsRoomEnum;
import com.cgm.infolab.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

public abstract class FromEntitiesToDtosMapper {

    private static final Logger log = LoggerFactory.getLogger(FromEntitiesToDtosMapper.class);

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
                messageEntity.getId(),
                messageEntity.getContent(),
                messageEntity.getTimestamp(),
                fromEntityToDto(messageEntity.getSender()),
                status
        );
    }

    public static RoomDto fromEntityToDto(RoomEntity roomEntity, String principalName) {
        String roomName =
                roomEntity.getRoomOrUser().equals(RoomOrUserAsRoomEnum.USER_AS_ROOM)
                        ? RoomName.of(Username.of(roomEntity.getName().value()), Username.of(principalName)).value()
                        : roomEntity.getName().value();

        String visibility =
                roomEntity.getVisibility() != null ? roomEntity.getVisibility().toString() : "";

        String roomType =
                roomEntity.getRoomType() != null ? roomEntity.getRoomType().toString() : "";

        RoomDto roomDto = RoomDto.of(
                roomName,
                roomEntity.getNotDownloadedMessagesCount(),
                roomEntity.getLastDownloadedDate(),
                roomEntity.getDescription(),
                visibility,
                roomType,
                roomEntity.getRoomOrUser()
        );

        LastMessageDto lastMessage;

        if (!roomEntity.getMessages().isEmpty()) {
            lastMessage = fromEntityToLastMessageDto(roomEntity.getMessages().get(0));
        } else {
            lastMessage = LastMessageDto.empty();
        }
        roomDto.setLastMessage(lastMessage);


        List<UserDto> userDtos = roomEntity.getOtherParticipants().stream().map(FromEntitiesToDtosMapper::fromEntityToDto).toList();
        roomDto.setOtherParticipants(userDtos);

        return roomDto;
    }


    public static UserDto fromEntityToDto(UserEntity userEntity) {

        return UserDto.of(
                userEntity.getName().value(),
                userEntity.getId(),
                userEntity.getDescription(),
                userEntity.getStatus().toString(),
                buildAvatarLinkForUser(userEntity)
        );
    }

    public static UserDto fromEntityToDtoComplete(UserEntity userEntity) {



        return UserDto.of(
                userEntity.getName().value(),
                userEntity.getId(),
                userEntity.getDescription(),
                userEntity.getStatus().toString(),
                userEntity.getTheme().toString(),
                buildAvatarLinkForUser(userEntity)
        );
    }

    public static BasicJsonDto<RoomDto> fromEntityToDto(String prev, String next, List<RoomEntity> roomEntities, String principalName) {
        PaginationLinksDto linksDto = PaginationLinksDto.of(prev, next);

        List<RoomDto> roomDtos = new ArrayList<>();

        roomEntities.forEach(roomEntity -> roomDtos.add(fromEntityToDto(roomEntity, principalName)));

        return BasicJsonDto.of(linksDto, roomDtos);
    }

    private static URI buildAvatarLinkForUser(UserEntity userEntity) {

        URI avatarURI = null;

        if (userEntity.getAvatarId().isPresent()) {
            try {
                avatarURI = new URI("/api/profile/avatar/%s".formatted(userEntity.getAvatarId()));
            } catch (URISyntaxException e) {
                log.warn("The avatar uri for user with username=%s has not been built correctly".formatted(userEntity.getName().value()));
            }
        }

        return avatarURI;
    }
}
