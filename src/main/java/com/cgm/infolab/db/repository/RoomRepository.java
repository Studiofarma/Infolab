package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@Component
public class RoomRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final ChatMessageRepository chatMessageRepository;

    private final String ROOMS_QUERY = "SELECT r.id room_id, r.roomname, r.visibility FROM infolab.rooms r ";
    private final String ROOMS_QUERY_JOINED = ROOMS_QUERY + "LEFT JOIN infolab.rooms_subscriptions s " +
                                                            "ON r.id = s.room_id " +
                                                            "LEFT JOIN infolab.users u " +
                                                            "ON u.id = s.user_id " +
                                                            "WHERE (u.username = ? OR r.visibility = 'PUBLIC') %s ";

    private final String ROOMS_DISTINCT_ON_QUERY =
                    "SELECT DISTINCT ON (r.roomname) " +
                            "r.id room_id, r.roomname, r.visibility, u.id user_id, u.username, " +
                            "m.id message_id, m.sent_at, m.content " +
                    "FROM infolab.chatmessages m " +
                    "LEFT JOIN infolab.rooms r ON r.id = m.recipient_room_id " +
                    "LEFT JOIN infolab.rooms_subscriptions s ON r.id = s.room_id " +
                    "LEFT JOIN infolab.users u ON u.id = s.user_id AND u.id = m.sender_id " +
                    "WHERE EXISTS " +
                    "(SELECT s.room_id FROM infolab.rooms_subscriptions s " +
                        "RIGHT JOIN infolab.users u ON u.id = s.user_id " +
                        "WHERE (u.username = ? OR r.visibility = 'PUBLIC')) %s " + // per aggiungere condizioni nel WHERE
                    "order by r.roomname, sent_at desc";

    public RoomRepository(JdbcTemplate jdbcTemplate,
                          DataSource dataSource,
                          ChatMessageRepository chatMessageRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.chatMessageRepository = chatMessageRepository;
    }

    public long add(RoomEntity room) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("rooms")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", room.getName().value());
        parameters.put("visibility", room.getVisibility().name());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che risale all'id di una room dal suo nome
     * @param roomName da cui risalire all'id
     * @return id della room con il nome passato a parametro. -1 in caso la room non esista.
     */
    public Optional<RoomEntity> getByRoomName(String roomName, Username username) {
        return queryRoom(addConditionToRoomsQueryJoined(" AND r.roomname = ? "), username.getValue(), roomName);
    }

    // Questo metodo è necessario perché altrimenti nella creazione della RoomSubscription in ChatController
    // non si sarebbe in grado di recuperare l'id della room, necessario per effettuare l'iscrizione.
    // Non ho potuto cambiare l'altro perché per ora la gestione della sicurezza in queryMessages di
    // ChatMessagesRepository è basata sul fatto che se non si ha accesso alla stanza allora non viene ritornato l'id
    // e viene lanciata un'eccezione
    public Optional<RoomEntity> getByRoomNameEvenIfNotSubscribed(String roomName) {
        return queryRoom(String.format("%s WHERE roomname = ?", ROOMS_QUERY), roomName);
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id, Username username) {
        return queryRoom(addConditionToRoomsQueryJoined("AND r.id = ?"), username.getValue(), id);
    }

    private Optional<RoomEntity> queryRoom(String query, Object... queryParams) {
        try {
            return Optional.ofNullable(
                    jdbcTemplate.queryForObject(query, this::mapToEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<RoomEntity> getAllWhereLastMessageNotNull(Username username) {
        return queryRooms(addConditionToNewRoomsDistinctOnQuery(""), username.getValue());
    }

    public List<RoomEntity> getAfterDate(LocalDate dateLimit, Username username) {
        if (dateLimit == null) {
            return getAllWhereLastMessageNotNull(username);
        }

        return queryRooms(addConditionToNewRoomsDistinctOnQuery("AND m.sent_at > ?"), username.getValue(), dateLimit);
    }

    private List<RoomEntity> queryRooms(String query, Object... queryParams) {
        try {
            return jdbcTemplate.query(query, this::mapToEntityWithMessages, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    /**
     * Rowmapper utilizzato nei metodi getByRoomName e getById
     */
    private RoomEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {
        return RoomEntity
                .of(rs.getLong("room_id"),
                        RoomName.of(rs.getString("roomname")),
                        VisibilityEnum.valueOf(rs.getString("visibility").trim()));
    }

    private RoomEntity mapToEntityWithMessages(ResultSet rs, int rowNum) throws SQLException {
        ChatMessageEntity message = chatMessageRepository.mapToEntity(rs, rowNum);
        return RoomEntity
                .of(rs.getLong("room_id"),
                        RoomName.of(rs.getString("roomname")),
                        VisibilityEnum.valueOf(rs.getString("visibility")),
                        List.of(message));
    }

    private String addConditionToNewRoomsDistinctOnQuery(String condition) {
        return String.format(ROOMS_DISTINCT_ON_QUERY, condition);
    }

    private String addConditionToRoomsQueryJoined(String condition) {
        return String.format(ROOMS_QUERY_JOINED, condition);
    }
}
