package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Classe creata soltanto per separare il codice di salvataggio nel database dal luogo dove viene usato.
// Poi probabilmente dovrebbe diventare una repository che contiene anche le operazioni di scrittura.
@Component
public class DBSavingManager {

    public static final String[] ROOMS = {"general"};

    private final DataSource dataSource;

    private final Logger log = LoggerFactory.getLogger(DBSavingManager.class);

    public DBSavingManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Metodo che aggiunge un utente al database.
     * @param username nome utente da salvare sul database.
     * @return chiave che è stata auto generata per l'utente creato, oppure -1 se l'utente inserito esisteva già.
     */
    public long addUser(String username) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("users")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("username", username);

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("User %s already exists in the database.", username));
        }
        return -1;
    }

    /**
     * Metodo che aggiunge un messaggio al database.
     * VERSIONE CON GLI ID DEGLI UTENTI HARDCODED DATO CHE NON CI SONO ANCORA I METODI PER RICAVARLI.
     * @param message messaggio da salvare.
     * @return chiave che è stata auto generata per il messaggio creato, oppure -1 se il messaggio inserito esisteva già.
     */
    public long addMessage(ChatMessage message) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        // TODO: sostituire questa parte con qualcosa che prende a run time gli id
        // Ricava l'id del mandante senza utilizzare la chiamata dal database (per il testing)
        long senderId = 1, recipientId = 1;
        /*if (message.getSender().equals("user1")) {
            senderId = 1;
            recipientId = 9;
        } else {
            senderId = 9;
            recipientId = 1;
        }*/

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", senderId);
        parameters.put("recipient_user_id", recipientId);
        parameters.put("recipient_room_id", 1); // TODO: ricavare l'id dal database come sopra
        parameters.put("sent_at", timestamp);
        parameters.put("content", message.getContent());

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Message %s already exists in the database.", message));
        }
        return -1;
    }

    /**
     * Metodo che aggiunge una stanza al database.
     * @return chiave che è stata auto generata per la stanza creata, oppure -1 se la stanza inserita esisteva già.
     */
    public long addRoom(String roomName) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("rooms")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", roomName);

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room %s already exists in the database.", roomName));
        }
        return -1;
    }

    /**
     * Metodo che aggiunge tutte le stanze all'avvio dell'app.
     */
    @PostConstruct
    void addAllRooms() {
        for (String s :
                ROOMS) {
            // TODO: eventualmente sostituire con batch operation.
            addRoom(s);
        }
    }
}
