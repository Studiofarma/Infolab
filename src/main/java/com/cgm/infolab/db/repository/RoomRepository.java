package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import com.cgm.infolab.db.repository.queryhelper.QueryResult;
import com.cgm.infolab.db.repository.queryhelper.UserQueryResult;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
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

    private final String ROOMS_WHERE_ROOMNAME = "r.roomname = :roomName";
    private final String CASE_QUERY =
            "CASE " +
                "WHEN r.visibility = 'PUBLIC' THEN r.description " +
                "ELSE u_other.username " +
            "END AS description";
    private final String JOIN = "left join infolab.rooms_subscriptions s_other on r.id = s_other.room_id and s_other.user_id <> s.user_id " +
            "left join infolab.users u_other on u_other.id = s_other.user_id";

    private final String ROOMS_AND_LAST_MESSAGES_WHERE_MESSAGE_IS_NOT_NULL_OR_ROOM_PUBLIC =
            "(m.id IS NOT NULL OR r.visibility = 'PUBLIC')";
    private final String ROOMS_AND_LAST_MESSAGES_WHERE_LAST_MESSAGE_NOT_NULL_FOR_PRIVATE_ROOMS =
            "(m.id IS NOT NULL OR r.visibility = 'PUBLIC')";
    private final String ROOMS_AND_LAST_MESSAGES_OTHER = "ORDER BY r.roomname, m.sent_at DESC";

    public RoomRepository(QueryHelper queryHelper, DataSource dataSource, ChatMessageRepository chatMessageRepository) {
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
        parameters.put("description", room.getDescription());
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
        return queryRoom(ROOMS_WHERE_ROOMNAME, username, map);
    }

    // Questo metodo è necessario perché altrimenti nella creazione della RoomSubscription in ChatController
    // non si sarebbe in grado di recuperare l'id della room, necessario per effettuare l'iscrizione.
    // Non ho potuto cambiare l'altro perché per ora la gestione della sicurezza in queryMessages di
    // ChatMessagesRepository è basata sul fatto che se non si ha accesso alla stanza allora non viene ritornato l'id
    // e viene lanciata un'eccezione
    public Optional<RoomEntity> getByRoomNameEvenIfNotSubscribed(RoomName roomName) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomName", roomName.value());
        return queryRoomNoUserRestriction(ROOMS_WHERE_ROOMNAME, map);
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id, Username username) {
        Map<String, Object> map = new HashMap<>();
        map.put("roomId", id);
        return  queryRoom("AND r.id = :roomId", username, map);
    }

    private Optional<RoomEntity> queryRoom(String where, Username username, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    getRoom(username)
                            .where(where)
                            .executeForObject(this::mapToEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private UserQueryResult getRoom(Username username) {
        return queryHelper
                .forUser(username)
                .query("SELECT r.id room_id, r.roomname, r.visibility, %s".formatted(CASE_QUERY))
                .join(JOIN);
    }

    private Optional<RoomEntity> queryRoomNoUserRestriction(String where, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    getRoomNoUserRestriction()
                            .where(where)
                            .executeForObject(this::mapToEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private QueryResult getRoomNoUserRestriction() {
        return queryHelper
                .query("SELECT r.id room_id, r.roomname, r.visibility, %s".formatted(CASE_QUERY))
                .from("infolab.rooms r")
                .join("left join infolab.rooms_subscriptions s on r.id = s.room_id %s".formatted(JOIN));
    }

    public List<RoomEntity> getAllRoomsAndLastMessageEvenIfNullInPublicRooms(Username username) {
        return queryRooms(ROOMS_AND_LAST_MESSAGES_WHERE_LAST_MESSAGE_NOT_NULL_FOR_PRIVATE_ROOMS, ROOMS_AND_LAST_MESSAGES_OTHER, username, new HashMap<>());
    }

    public List<RoomEntity> getAfterDate(LocalDate dateLimit, Username username) {
        if (dateLimit == null) {
            return getAllRoomsAndLastMessageEvenIfNullInPublicRooms(username);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("date", dateLimit);

        return queryRooms(
                "%s AND m.sent_at > :date".formatted(ROOMS_AND_LAST_MESSAGES_WHERE_LAST_MESSAGE_NOT_NULL_FOR_PRIVATE_ROOMS),
                ROOMS_AND_LAST_MESSAGES_OTHER,
                username,
                map
        );
    }

    private List<RoomEntity> queryRooms(String where, String other, Username username, Map<String, ?> queryParams) {
        where = (where.equals("") || where == null) ? "(m.id IS NOT NULL OR r.visibility = 'PUBLIC')" : "(m.id IS NOT NULL OR r.visibility = 'PUBLIC') AND %s".formatted(where);
        try {
            return getRooms(username)
                    .where(where)
                    .other(other)
                    .executeForList(this::mapToEntityWithMessages, queryParams);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private UserQueryResult getRooms(Username username) {
        return queryHelper
                .forUser(username)
                .query("SELECT DISTINCT ON (r.roomname) r.id room_id, r.roomname, " +
                        "r.visibility, u_mex.id user_id, u_mex.username username, m.id message_id, m.sent_at, m.content, m.sender_id, %s".formatted(CASE_QUERY))
                .join("LEFT JOIN infolab.chatmessages m ON r.id = m.recipient_room_id LEFT JOIN infolab.users u_mex ON u_mex.id = m.sender_id " +
                        "left join infolab.rooms_subscriptions s_other on r.id = s_other.room_id and s_other.user_id <> s.user_id " +
                        "left join infolab.users u_other on u_other.id = s_other.user_id");
    }

    /**
     * Rowmapper utilizzato nei metodi getByRoomName e getById
     */
    private RoomEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {
        return RoomEntity
                .of(rs.getLong("room_id"),
                        RoomName.of(rs.getString("roomname")),
                        VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                        rs.getString("description"));
    }

    private RoomEntity mapToEntityWithMessages(ResultSet rs, int rowNum) throws SQLException {
        if (rs.getString("content") != null) {
            ChatMessageEntity message = chatMessageRepository.mapToEntity(rs, rowNum);

            return RoomEntity
                    .of(rs.getLong("room_id"),
                            RoomName.of(rs.getString("roomname")),
                            VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                            rs.getString("description"),
                            List.of(message));
        } else {
            return RoomEntity
                    .of(rs.getLong("room_id"),
                            RoomName.of(rs.getString("roomname")),
                            VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                            rs.getString("description"),
                            List.of(ChatMessageEntity.empty()));
        }
    }
}
