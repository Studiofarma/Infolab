package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

// Classe creata soltanto per separare il codice di salvataggio nel database dal luogo dove viene usato.
// Poi probabilmente dovrebbe diventare una repository che contiene anche le operazioni di scrittura.
@Component
public class DBSavingManager {

    @Value("${spring.datasource.driver-class-name}")
    private String dbDriverClassName;
    @Value("${spring.datasource.url}")
    private String dbDatasourceUrl;
    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private final Logger log = LoggerFactory.getLogger(DBSavingManager.class);

    //@Bean
    private DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(dbDriverClassName);
        dataSource.setUrl(dbDatasourceUrl);
        dataSource.setUsername(dbUsername);
        dataSource.setPassword(dbPassword);

        return dataSource;
    }

    /**
     * Metodo che aggiunge un utente al database.
     * @param username nome utente da salvare sul database.
     * @return chiave che è stata auto generata per l'utente creato, oppure -1 se l'utente inserito esisteva già.
     */
    public long addUser(String username) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource())
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
     * Metodo che aggiunge una stanza al database.
     * PER ADESSO AGGIUNGE SOLTANTO LA STANZA PUBLIC (HARDCODED) PER IL TESTING.
     * @return chiave che è stata auto generata per la stanza creata, oppure -1 se la stanza inserita esisteva già.
     */
    public long addRoom() {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource())
                .withSchemaName("infolab")
                .withTableName("rooms")
                .usingGeneratedKeyColumns("id");

        // TODO: rimuovere nome stanza hardcoded
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", "public");

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room %s already exists in the database.", "public"));
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
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource())
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        // TODO: sostituire questa parte con qualcosa che prende a run time gli id
        // Ricava l'id del mandante senza utilizzare la chiamata dal database (per il testing)
        long senderId, recipientId;
        if (message.getSender().equals("user1")) {
            senderId = 1;
            recipientId = 9;
        } else {
            senderId = 9;
            recipientId = 1;
        }

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
}
