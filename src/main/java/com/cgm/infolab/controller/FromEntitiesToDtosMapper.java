package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.model.UserDto;

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

    public static RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(
                roomEntity.getName().value(),
                roomEntity.getNotDownloadedMessagesCount(),
                roomEntity.getLastDownloadedDate(),
                roomEntity.getDescription(),
                roomEntity.getVisibility().toString(),
                roomEntity.getRoomType().toString()
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
}
