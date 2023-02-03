package com.cgm.infolab;

import com.cgm.infolab.db.RoomRepository;
import com.cgm.infolab.model.Room;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RunAfterStartup {

    public static final String[] ROOMS = {"general"};
    public static final Room[] ROOMS2 = {new Room("general")};
    private RoomRepository roomRepository;

    public RunAfterStartup(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void addAllRooms() {
        for (Room r :
                ROOMS2) {
            // TODO: eventualmente sostituire con batch operation.
            roomRepository.add(r);
        }
    }
}
