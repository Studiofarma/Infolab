package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.model.UserDto;
import org.springframework.stereotype.Service;

public abstract class FromEntitiesToDtosMapper {

    public static ChatMessageDto fromEntityToChatMessageDto(ChatMessageEntity messageEntity) {
        return new ChatMessageDto(messageEntity.getContent(),
                messageEntity.getTimestamp(),
                messageEntity.getSender().getName().value());
    }

    public static LastMessageDto fromEntityToLastMessageDto(ChatMessageEntity messageEntity) {
        return LastMessageDto.of(messageEntity.getContent(), messageEntity.getTimestamp(), messageEntity.getSender());
    }

    public static RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName().value(), roomEntity.getDescription());

        LastMessageDto lastMessage = fromEntityToLastMessageDto(roomEntity.getMessages().get(0));
        roomDto.setLastMessage(lastMessage);

        return roomDto;
    }

    public static UserDto fromEntityToDto(UserEntity userEntity) {
        return UserDto.of(userEntity.getName().value(), userEntity.getId(), userEntity.getDescription());
    }
}
