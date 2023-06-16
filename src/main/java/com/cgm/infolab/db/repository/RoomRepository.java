package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
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
    private final QueryHelper queryHelper;
    private final DataSource dataSource;
    private final ChatMessageRepository chatMessageRepository;

    private final String ROOMS_SELECT = "SELECT r.id room_id, r.roomname, r.visibility";
    private final String ROOMS_FROM = "infolab.rooms r";
    private final String ROOMS_WHERE_ROOMNAME = "r.roomname = :roomName";
    private final String ROOMS_WHERE_ROOMID = "AND r.id = :roomId";

    private final String ROOMS_AND_LAST_MESSAGES_SELECT =
            "SELECT DISTINCT ON (r.roomname) r.id room_id, r.roomname, r.visibility, u_mex.id user_id, u_mex.username username, m.id message_id, m.sent_at, m.content, m.sender_id";
    private final String ROOMS_AND_LAST_MESSAGES_JOIN =
            "LEFT JOIN infolab.chatmessages m ON r.id = m.recipient_room_id LEFT JOIN infolab.users u_mex ON u_mex.id = m.sender_id";
    private final String ROOMS_AND_LAST_MESSAGES_WHERE_AFTER_DATE = "m.sent_at > :date";
    private final String ROOMS_AND_LAST_MESSAGES_OTHER = "ORDER BY r.roomname, m.sent_at DESC";

    public RoomRepository(QueryHelper queryHelper, DataSource dataSource,
                          ChatMessageRepository chatMessageRepository) {
        this.queryHelper = queryHelper;
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
    public Optional<RoomEntity> getByRoomName(RoomName roomName, Username username) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());
        return queryRoom(ROOMS_SELECT, ROOMS_WHERE_ROOMNAME, username, map);
    }

    // Questo metodo è necessario perché altrimenti nella creazione della RoomSubscription in ChatController
    // non si sarebbe in grado di recuperare l'id della room, necessario per effettuare l'iscrizione.
    // Non ho potuto cambiare l'altro perché per ora la gestione della sicurezza in queryMessages di
    // ChatMessagesRepository è basata sul fatto che se non si ha accesso alla stanza allora non viene ritornato l'id
    // e viene lanciata un'eccezione
    public Optional<RoomEntity> getByRoomNameEvenIfNotSubscribed(RoomName roomName) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());
        return queryRoomNoUserRestriction(ROOMS_SELECT, ROOMS_FROM, null, ROOMS_WHERE_ROOMNAME, null, map);
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id, Username username) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomId", id);
        return  queryRoom(ROOMS_SELECT, ROOMS_WHERE_ROOMID, username, map);
    }

    private Optional<RoomEntity> queryRoom(String select, String where, Username username, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    queryHelper.forUSer(username)
                            .query(select)
                            .where(where)
                            .executeForObject(this::mapToEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private Optional<RoomEntity> queryRoomNoUserRestriction(String select, String from, String join, String where, String other, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    queryHelper.query(select)
                            .from(from)
                            .join(join)
                            .where(where)
                            .other(other)
                            .executeForObject(this::mapToEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<RoomEntity> getAllWhereLastMessageNotNull(Username username) {
        return queryRooms(ROOMS_AND_LAST_MESSAGES_SELECT, ROOMS_AND_LAST_MESSAGES_JOIN, null, ROOMS_AND_LAST_MESSAGES_OTHER, username, new HashMap<>());
    }

    public List<RoomEntity> getAfterDate(LocalDate dateLimit, Username username) {
        if (dateLimit == null) {
            return getAllWhereLastMessageNotNull(username);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("date", dateLimit);

        return queryRooms(
                ROOMS_AND_LAST_MESSAGES_SELECT,
                ROOMS_AND_LAST_MESSAGES_JOIN,
                ROOMS_AND_LAST_MESSAGES_WHERE_AFTER_DATE,
                ROOMS_AND_LAST_MESSAGES_OTHER,
                username,
                map
        );
    }

    private List<RoomEntity> queryRooms(String select, String join, String where, String other, Username username, Map<String, ?> queryParams) {
        try {
            return queryHelper.forUSer(username)
                    .query(select)
                    .join(join)
                    .where(where)
                    .other(other)
                    .executeForList(this::mapToEntityWithMessages, queryParams);
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
                        VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                        List.of(message));
    }
}
