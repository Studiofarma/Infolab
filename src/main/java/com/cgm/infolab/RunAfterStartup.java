package com.cgm.infolab;

import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.model.RoomEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

@Component
public class RunAfterStartup {

    public static final RoomEntity[] TEST_ROOMS = {RoomEntity.of("testRoom1"), RoomEntity.of("testRoom2")};
    public static final RoomEntity[] ROOMS = {RoomEntity.of("general")};
    private final RoomRepository roomRepository;

    private final Logger log = LoggerFactory.getLogger(RunAfterStartup.class);

    public RunAfterStartup(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void addAllRooms() {
        for (RoomEntity r : ROOMS) {
            try {
                roomRepository.add(r);
            } catch (DuplicateKeyException e) {
                log.info(String.format("Room roomName=\"%s\" già esistente nel database", r.getName()));
            }
        }
        for (RoomEntity r : TEST_ROOMS) {
            try {
                roomRepository.add(r);
            } catch (DuplicateKeyException e) {
                log.info(String.format("Room roomName=\"%s\" già esistente nel database", r.getName()));
            }
        }
    }
}
