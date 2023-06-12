package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

@Component
public class RunAfterStartup {

    public static final RoomEntity[] TEST_ROOMS =
            {RoomEntity.of(RoomName.of("user1-user2"), VisibilityEnum.PRIVATE)};
    public static final UserEntity[] TEST_USERS =
            {UserEntity.of(Username.of("user1"), "Mario Rossi"),
            UserEntity.of(Username.of("user2"), "Fabrizio Bruno"),
            UserEntity.of(Username.of("user3"), "Ruggero Esposito"),
            UserEntity.of(Username.of("user4"), "Ileana Trentino"),
            UserEntity.of(Username.of("davide.giudici"), "WARDEN OF GIT"),
            UserEntity.of(Username.of("mattia.pedersoli"), "Amante delle bambine"),
            UserEntity.of(Username.of("luca.minini"), "Dispenser di bambine")};
    public static final RoomEntity[] ROOMS = {RoomEntity.of(RoomName.of("general"), VisibilityEnum.PUBLIC)};

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    private final Logger log = LoggerFactory.getLogger(RunAfterStartup.class);

    public RunAfterStartup(RoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void addComponentsToDb() {
        saveRooms(ROOMS);
        saveRooms(TEST_ROOMS);
        saveUsers(TEST_USERS);
    }

    private void saveRooms(RoomEntity[] roomEntities) {
        for (RoomEntity r : roomEntities) {
            try {
                roomRepository.add(r);
            } catch (DuplicateKeyException e) {
                log.info(String.format("Room roomName=\"%s\" già esistente nel database", r.getName().value()));
            }
        }
    }

    private void saveUsers(UserEntity[] userEntities) {
        for (UserEntity u : userEntities) {
            try {
                userRepository.add(u);
            } catch (DuplicateKeyException e) {
                log.info(String.format("User username=\"%s\" già esistente nel database", u.getName().value()));
            }
        }
    }
}
