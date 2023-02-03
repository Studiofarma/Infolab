package com.cgm.infolab;

import com.cgm.infolab.DBManager;
import com.cgm.infolab.db.RoomRepository;
import com.cgm.infolab.model.Room;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RunAfterStartup {

    public static final String[] ROOMS = {"general"};
    public static final Room[] ROOMS2 = {new Room("general")};
    private DBManager dbManager;
    private RoomRepository roomRepository;

    public RunAfterStartup(DBManager dbManager, RoomRepository roomRepository) {
        this.dbManager = dbManager;
        this.roomRepository = roomRepository;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void addAllRooms() {
        /*for (String s :
                ROOMS) {
            // TODO: eventualmente sostituire con batch operation.
            dbManager.addRoom(s);
        }*/
        for (Room r :
                ROOMS2) {
            // TODO: eventualmente sostituire con batch operation.
            //dbManager.addRoom(s);
            roomRepository.add(r);
        }
    }
}
