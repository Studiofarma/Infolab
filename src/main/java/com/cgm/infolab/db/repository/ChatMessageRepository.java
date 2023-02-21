package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.ZoneId;
import java.util.*;

@Component
public class ChatMessageRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    private final Logger log = LoggerFactory.getLogger(ChatMessageRepository.class);

    public ChatMessageRepository(JdbcTemplate jdbcTemplate, DataSource dataSource,
                                 UserRepository userRepository, RoomRepository roomRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Metodo che aggiunge un messaggio al database.
     * @param message messaggio da salvare.
     * @return chiave che è stata auto generata per il messaggio creato, oppure -1 se il messaggio inserito esisteva già.
     */
    public long add(ChatMessageEntity message) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("chatmessages")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sender_id", message.getSender().getId());
        parameters.put("recipient_room_id", message.getRoom().getId());
        parameters.put("sent_at", message.getTimestamp());
        parameters.put("content", message.getContent());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che ritorna tutti i messaggi mandati in una room.
     * @param roomName da cui prendere i messaggi
     * @return lista di messaggi trovati. Ritorna null se non è stato trovato nessun messaggio.
     */
    public List<ChatMessageEntity> getByRoomName(String roomName) {

        RoomEntity room = roomRepository.getByRoomName(roomName).orElseThrow(() -> {
            throw new IllegalArgumentException(String.format("Room roomName=\"%s\" non trovata.", roomName));
        });

        String query = "WHERE recipient_room_id = ?";

        return get(query, room.getId());
    }

    /**
     * Metodo che ritorna numberOfMessages messaggi in una stanza specificata.
     * @param roomName nome della stanza da cui prendere i messaggi.
     * @param numberOfMessages numero di messaggi massimo da prendere. Se < 0 verranno presi tutti comunque.
     * @return Lista di messaggi.
     */
    public List<ChatMessageEntity> getByRoomNameNumberOfMessages(String roomName, int numberOfMessages) {
        RoomEntity room = roomRepository.getByRoomName(roomName).orElseThrow(() -> {
            throw new IllegalArgumentException(String.format("Room roomName=\"%s\" non trovata.", roomName));
        });

        // In caso il parametro non sia valido vengono ritornati tutti i messaggi disponibili.
        if (numberOfMessages < 0) {
            return getByRoomName(roomName);
        }

        String query = "WHERE recipient_room_id = ? LIMIT ?";

        return get(query, room.getId(), numberOfMessages);
    }

    /**
     * Metodo generale per prendere messaggi dal database.
     * @param condition condizioni aggiuntive con cui prendere i messaggi dal database.
     * @param objects parametri ordinati che servono per le condizioni.
     * @return lista di messaggi che rispetta le condizioni specificate.
     */
    private List<ChatMessageEntity> get(String condition, Object... objects) {
        StringBuilder query = new StringBuilder("SELECT * FROM infolab.chatmessages ");

        String cond1;
        String condLimit = null;

        if (condition.contains("LIMIT")) {
            cond1 = condition.substring(0, condition.indexOf("LIMIT"));
            condLimit = condition.substring(condition.indexOf("LIMIT"));
        } else {
            cond1 = condition;
        }

        query.append(cond1);

        query.append(" ORDER BY sent_at DESC ");

        if (condLimit != null) {
            query.append(condLimit);
        }

        try {
            return jdbcTemplate.query(query.toString(), this::chatMessageRowMapper, objects);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private ChatMessageEntity chatMessageRowMapper(ResultSet rs, int rowNum) throws SQLException {
        ChatMessageEntity message = ChatMessageEntity.emptyMessage();
        message.setId(rs.getLong("id"));

        long userId = Long.parseLong(rs.getString("sender_id"));
        message.setSender(userRepository.getById(userId).orElseGet(() -> {
            log.info(String.format("Utente userId=\"%d\" non trovato.", userId));
            return null;
        }));

        long roomId = Long.parseLong(rs.getString("recipient_room_id"));
        message.setRoom(roomRepository.getById(roomId).orElseGet(() -> {
            log.info(String.format("Room roomId=\"%d\" non trovato.", roomId));
            return null;
        }));

        //TODO: sistemare bug per cui la data viene presa come UTC e non con la timezone richiesta
        message.setTimestamp(rs.getTimestamp("sent_at").toInstant().atZone(ZoneId.of("Europe/Rome")).toLocalDateTime());
        message.setContent(rs.getString("content"));
        return message;
    }
}
