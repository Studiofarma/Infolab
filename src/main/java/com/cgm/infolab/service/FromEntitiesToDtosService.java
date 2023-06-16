package com.cgm.infolab.service;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.model.UserDto;
import org.springframework.stereotype.Service;

@Service
public class FromEntitiesToDtosService {
    public ChatMessageDto fromEntityToChatMessageDto(ChatMessageEntity messageEntity) {
        return new ChatMessageDto(messageEntity.getContent(),
                messageEntity.getTimestamp(),
                messageEntity.getSender().getName().value());
    }

    public LastMessageDto fromEntityToLastMessageDto(ChatMessageEntity messageEntity) {
        return LastMessageDto.of(messageEntity.getContent(), messageEntity.getTimestamp(), messageEntity.getSender());
    }

    public RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName().value());

        LastMessageDto lastMessage = fromEntityToLastMessageDto(roomEntity.getMessages().get(0));
        roomDto.setLastMessage(lastMessage);

        return roomDto;
    }

    public UserDto fromEntityToDto(UserEntity userEntity) {
        return UserDto.of(userEntity.getName().value(), userEntity.getId(), userEntity.getDescription());
    }
}
