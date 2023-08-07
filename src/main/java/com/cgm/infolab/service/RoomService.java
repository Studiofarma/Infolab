package com.cgm.infolab.service;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.CursorEnum;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RoomSubscriptionRepository;
import com.cgm.infolab.helper.DateTimeHelper;
import com.cgm.infolab.model.RoomCursor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomSubscriptionRepository roomSubscriptionRepository;

    private final Logger log = LoggerFactory.getLogger(RoomService.class);

    @Autowired
    public RoomService(RoomRepository roomRepository,
                       RoomSubscriptionRepository roomSubscriptionRepository) {
        this.roomRepository = roomRepository;
        this.roomSubscriptionRepository = roomSubscriptionRepository;
    }

    public List<RoomEntity> getRooms(String date, Username username) {
        return roomRepository.getAfterDate(DateTimeHelper.fromStringToDate(date), username);
    }

    public List<RoomEntity> getRoomsAndUsers(Integer pageSize, RoomCursor pageBefore, RoomCursor pageAfter, Username username) {
        if (pageAfter == null && pageBefore == null) {
            return roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(pageSize, CursorEnum.NONE, null, username);
        } else if (pageAfter != null) {
            return roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(pageSize, CursorEnum.PAGE_AFTER, pageAfter, username);
        } else { // pageBefore != null
            return roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(pageSize, CursorEnum.PAGE_BEFORE, pageBefore, username);
        }
    }

    private RoomEntity createPrivateRoom(Username user1, Username user2) {
        RoomName roomName = RoomName.of(user1, user2);

        try {
            return roomRepository.add(RoomEntity.of(roomName, VisibilityEnum.PRIVATE, RoomTypeEnum.USER2USER));
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room roomName=\"%s\" già esistente nel database", roomName));
            return roomRepository.getByRoomNameEvenIfNotSubscribed(roomName).orElseGet(() -> null);
        }
    }

    private void subscribeUserToRoom(RoomName roomName, Username username) {
        RoomSubscriptionEntity roomSubscription = RoomSubscriptionEntity.empty();
        try {
            roomSubscription.setRoomName(roomName);
            roomSubscription.setUsername(username);
            roomSubscriptionRepository.add(roomSubscription);
        } catch (DuplicateKeyException e) {
            log.info("RoomSubscription " + roomSubscription + "già esistente nel database");
        } catch (SQLIntegrityConstraintViolationException e) {
            log.error("Lo user con username=" + username.value() + " o la room con roomname=" + roomName.value() + " non esistono nel database");
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
