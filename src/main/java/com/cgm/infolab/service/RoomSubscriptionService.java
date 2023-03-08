package com.cgm.infolab.service;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomSubscriptionEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RoomSubscriptionRepository;
import com.cgm.infolab.db.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class RoomSubscriptionService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomSubscriptionRepository roomSubscriptionRepository;

    private final Logger log = LoggerFactory.getLogger(RoomSubscriptionService.class);

    public RoomSubscriptionService(UserRepository userRepository, RoomRepository roomRepository, RoomSubscriptionRepository roomSubscriptionRepository) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomSubscriptionRepository = roomSubscriptionRepository;
    }

    public void subscribeUserToRoom(String roomName, String username) {
        RoomSubscriptionEntity roomSubscription = RoomSubscriptionEntity.empty();
        try {
            RoomEntity room = roomRepository.getByRoomNameEvenIfNotSubscribed(roomName).orElseGet(() -> {
                // Qui dentro non dovrebbe mai entrarci, dato che la room general viene aggiunta al lancio dell'app
                return null;
            });

            UserEntity user = userRepository.getByUsername(username).orElseGet(() -> {
                // Qui dentro non dovrebbe mai entrarci, dato che l'utente se non c'era è stato aggiunto
                log.info(String.format("User username=\"%s\" non trovato.", username));
                return null;
            });

            roomSubscription.setRoomId(room.getId());
            roomSubscription.setUserId(user.getId());

            roomSubscriptionRepository.add(roomSubscription);
        } catch (DuplicateKeyException e) {
            log.info("RoomSubscription " + roomSubscription + "già esistente nel database");
        }
    }
}
