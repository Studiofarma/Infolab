package com.cgm.infolab;

import com.cgm.infolab.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Classe creata soltanto per separare il codice di salvataggio nel database dal luogo dove viene usato.
// Poi probabilmente dovrebbe diventare una repository che contiene anche le operazioni di scrittura.
@Component
public class DBManager {
    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<ChatMessage> messageRowMapper;

    private final Logger log = LoggerFactory.getLogger(DBManager.class);

    public DBManager(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
        this.messageRowMapper = (rs, rowNum) -> {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSender(rs.getString("sender_id"));
            chatMessage.setContent(rs.getString("content"));
            return chatMessage;
        };
    }

    private SimpleJdbcInsert initSimpleJdbcInsert(String tableName) {
        return new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName(tableName)
                .usingGeneratedKeyColumns("id");
    }

    //region add methods
    /**
     * Metodo che aggiunge un utente al database.
     * @param username nome utente da salvare sul database.
     * @return chiave che è stata auto generata per l'utente creato, oppure -1 se l'utente inserito esisteva già.
     */
    public long addUser(String username) {
        SimpleJdbcInsert simpleJdbcInsert = initSimpleJdbcInsert("users");

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
        SimpleJdbcInsert simpleJdbcInsert = initSimpleJdbcInsert("chatmessages");

        long senderId = getUserId(message.getSender());

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", senderId);
        // TODO: trovare un modo per prendere la room in cui il messaggio arriva.
        parameters.put("recipient_room_id", getRoomId("general"));
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
        SimpleJdbcInsert simpleJdbcInsert = initSimpleJdbcInsert("rooms");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", roomName);

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room %s already exists in the database.", roomName));
        }
        return -1;
    }
    //endregion

    //region get methods
    public List<ChatMessage> getMessagesByRoom(String room) {

        long roomId = getRoomId(room);

        String query = "SELECT * FROM infolab.chatmessages WHERE recipient_room_id = ?";

        return jdbcTemplate.query(query, new Object[]{roomId}, messageRowMapper);
    }

    /**
     * Metodo che risale all'id di una room dal suo nome
     * @param roomName nome da cui risalire all'id
     * @return id della room con il nome passato a parametro. -1 in caso la room non esista. TODO da aggiungere.
     */
    public long getRoomId(String roomName) {
        String query = "SELECT id FROM infolab.rooms WHERE roomname = ?";
        long roomId;
        try {
            roomId = jdbcTemplate.queryForObject(
                    query, new Object[] {roomName}, Long.class);
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("La room con nome = %s non esiste", roomName));
            roomId = -1;
        }

        return roomId;
    }

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username username da cui risalire all'id
     * @return id dell'utente con il nome passato a parametro. -1 in caso l'utente non esista. TODO da aggiungere.
     */
    public long getUserId(String username) {
        String query = "SELECT id FROM infolab.users WHERE username = ?";
        long userId;
        try {
            userId = jdbcTemplate.queryForObject(
                    query, new Object[] {username}, Long.class);
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("L'user con nome = %s non esiste", username));
            userId = -1;
        }
        return userId;
    }
    //endregion
}
