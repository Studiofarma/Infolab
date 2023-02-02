package com.cgm.infolab;

import com.cgm.infolab.DBManager;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RunAfterStartup {

    public static final String[] ROOMS = {"general"};
    private DBManager dbManager;

    public RunAfterStartup(DBManager dbManager) {
        this.dbManager = dbManager;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void addAllRooms() {
        for (String s :
                ROOMS) {
            // TODO: eventualmente sostituire con batch operation.
            dbManager.addRoom(s);
        }
    }
}
