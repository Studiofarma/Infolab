package com.cgm.infolab.service;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RoomSubscriptionRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomSubscriptionRepository roomSubscriptionRepository;

    private final Logger log = LoggerFactory.getLogger(RoomService.class);

    @Autowired
    public RoomService(ChatService chatService,
                       UserRepository userRepository,
                       RoomRepository roomRepository,
                       RoomSubscriptionRepository roomSubscriptionRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomSubscriptionRepository = roomSubscriptionRepository;
    }

    public RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName().value());

        LastMessageDto message = chatService.fromEntityToLastMessageDto(roomEntity.getMessages().get(0));

        roomDto.setLastMessage(message);

        return roomDto;
    }

    public List<RoomEntity> getRooms(String date, Username username) {
        return roomRepository.getAfterDate(fromStringToDate(date), username);
    }

    private LocalDate fromStringToDate(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse(date, formatter);
        }
    }

    private RoomEntity createPrivateRoom(Username user1, Username user2) {
        RoomName roomName = RoomName.of(user1, user2);

        try {
            long roomId = roomRepository.add(RoomEntity.of(roomName, VisibilityEnum.PRIVATE));
            return RoomEntity.of(roomId, roomName, VisibilityEnum.PRIVATE);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room roomName=\"%s\" già esistente nel database", roomName));
            return roomRepository.getByRoomNameEvenIfNotSubscribed(roomName).orElseGet(() -> null);
        }
    }

    private void subscribeUserToRoom(RoomName roomName, Username username) {
        RoomSubscriptionEntity roomSubscription = RoomSubscriptionEntity.empty();
        try {
            RoomEntity room = roomRepository.getByRoomNameEvenIfNotSubscribed(roomName).orElseThrow(() -> {
                throw new IllegalArgumentException(String.format("Room roomName=\"%s\" non trovata.", roomName.value()));
            });

            UserEntity user = userRepository.getByUsername(username).orElseThrow(() -> {
                throw new IllegalArgumentException(String.format("User username=\"%s\" non trovato.", username.value()));
            });

            roomSubscription.setRoomId(room.getId());
            roomSubscription.setUserId(user.getId());

            roomSubscriptionRepository.add(roomSubscription);
        } catch (DuplicateKeyException e) {
            log.info("RoomSubscription " + roomSubscription + "già esistente nel database");
        }
    }

    private void subscribeUsersToRoom(RoomName roomName, Username... usernames) {
        for (Username u : usernames) {
            subscribeUserToRoom(roomName, u);
        }
    }

    public void createPrivateRoomAndSubscribeUsers(Username user1, Username user2) {
        RoomEntity room = createPrivateRoom(user1, user2);
        subscribeUsersToRoom(room.getName(), user1, user2);
    }
}
