package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.helper.TestJwtHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class RunAfterStartup {

    public static final RoomEntity[] TEST_ROOMS =
            {RoomEntity.of(RoomName.of("user1-user2"), VisibilityEnum.PRIVATE, RoomTypeEnum.USER2USER),
            RoomEntity.of(RoomName.of("user1-user3"), VisibilityEnum.PRIVATE, RoomTypeEnum.USER2USER),
            RoomEntity.of(RoomName.of("user3-user4"), VisibilityEnum.PRIVATE, RoomTypeEnum.USER2USER)};
    public static final UserEntity[] TEST_USERS =
            {UserEntity.of(Username.of("user1"), "Mario Rossi"),
            UserEntity.of(Username.of("user2"), "Fabrizio Bruno"),
            UserEntity.of(Username.of("davide.giudici"), "Davide Giudici"),
            UserEntity.of(Username.of("mattia.pedersoli"), "Mattia Pedersoli"),
            UserEntity.of(Username.of("luca.minini"), "Luca Minini"),
            UserEntity.of(Username.of("lorenzo"), "Lorenzo"),
            UserEntity.of(Username.of("daniele"), "Daniele"),
            UserEntity.of(Username.of("davide"), "Davide"),
            UserEntity.of(Username.of("mirko"), "Mirko"),
            };
    public static final RoomEntity[] ROOMS = {RoomEntity.general()};

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final Environment env;
    @Value("${server.port}")
    private int port;

    private final Logger log = LoggerFactory.getLogger(RunAfterStartup.class);

    public RunAfterStartup(
        RoomRepository roomRepository,
        UserRepository userRepository,
        Environment env) {

        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.env = env;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void addComponentsToDb() {
        saveRooms(ROOMS);

        if(Arrays.asList(env.getActiveProfiles()).contains("dev")){
            saveRooms(TEST_ROOMS);
            saveUsers(TEST_USERS);

            System.out.println(
                    "URL to login as lorenzo through jwt: http://localhost:%d/?access_token=%s"
                            .formatted(port, new TestJwtHelper().generateToken("infolab", "lorenzo").getTokenValue()));
        }
    }

    private void saveRooms(RoomEntity[] roomEntities) {
        for (RoomEntity r : roomEntities) {
            try {
                roomRepository.add(r);
            } catch (DuplicateKeyException e) {
                log.info(String.format("Room roomName=\"%s\" already existing in database", r.getName().value()));
            }
        }
    }

    private void saveUsers(UserEntity[] userEntities) {
        for (UserEntity u : userEntities) {
            try {
                userRepository.add(u);
            } catch (DuplicateKeyException e) {
                log.info(String.format("User username=\"%s\" already existing in database", u.getName().value()));
            }
        }
    }
}
