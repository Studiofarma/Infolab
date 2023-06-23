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
import java.time.LocalDate;
import java.util.*;

import static com.cgm.infolab.db.repository.DownloadDateRepository.*;

@Component
public class RoomRepository {
    private final QueryHelper queryHelper;
    private final DataSource dataSource;

    private final String ROOMS_WHERE_ROOMNAME = "r.roomname = :roomName";
    private final String CASE_QUERY =
            "CASE " +
                "WHEN r.visibility = 'PUBLIC' THEN r.description " +
                "ELSE u_other.username " +
            "END AS description";
    private final String JOIN = "left join infolab.rooms_subscriptions s_other on r.id = s_other.room_id and s_other.user_id <> s.user_id " +
            "left join infolab.users u_other on u_other.id = s_other.user_id";

    private final String ROOMS_AND_LAST_MESSAGES_OTHER = "ORDER BY r.roomname, m.sent_at DESC";

    public RoomRepository(QueryHelper queryHelper, DataSource dataSource) {
        this.queryHelper = queryHelper;
        this.dataSource = dataSource;
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
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomName", roomName.value());
        return queryRoom(ROOMS_WHERE_ROOMNAME, username, arguments);
    }

    // Questo metodo è necessario perché altrimenti nella creazione della RoomSubscription in ChatController
    // non si sarebbe in grado di recuperare l'id della room, necessario per effettuare l'iscrizione.
    // Non ho potuto cambiare l'altro perché per ora la gestione della sicurezza in queryMessages di
    // ChatMessagesRepository è basata sul fatto che se non si ha accesso alla stanza allora non viene ritornato l'id
    // e viene lanciata un'eccezione
    public Optional<RoomEntity> getByRoomNameEvenIfNotSubscribed(RoomName roomName) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomName", roomName.value());
        return queryRoomNoUserRestriction(ROOMS_WHERE_ROOMNAME, arguments);
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id, Username username) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomId", id);
        return  queryRoom("AND r.id = :roomId", username, arguments);
    }

    private Optional<RoomEntity> queryRoom(String where, Username username, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    getRoom(username)
                            .where(where)
                            .executeForObject(RowMappers::mapToRoomEntity, queryParams)
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
                            .executeForObject(RowMappers::mapToRoomEntity, queryParams)
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
        List<RoomEntity> rooms = queryRooms(null, ROOMS_AND_LAST_MESSAGES_OTHER, username, new HashMap<>());
        Map<Long, Integer> notDownloadedCountsList = getNotDownloadedYetNumberByRoomName(username);

        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        return rooms;
    }

    public List<RoomEntity> getAfterDate(LocalDate dateLimit, Username username) {
        if (dateLimit == null) {
            return getAllRoomsAndLastMessageEvenIfNullInPublicRooms(username);
        }

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("date", dateLimit);

        List<RoomEntity> rooms = queryRooms(
                "AND m.sent_at > :date",
                ROOMS_AND_LAST_MESSAGES_OTHER,
                username,
                arguments
        );

        Map<Long, Integer> notDownloadedCountsList = getNotDownloadedYetNumberByRoomName(username);

        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        return rooms;
    }

    private List<RoomEntity> mergeRoomsAndNotDownloadedCount(List<RoomEntity> rooms, Map<Long, Integer> notDownloadedCountsList) {
        rooms.forEach(room -> {
            Integer countObj = notDownloadedCountsList.get(room.getId());
            int count = countObj == null ? 0 : countObj;

            room.setNotDownloadedMessagesCount(count);

            rooms.set(rooms.indexOf(room), room);
        });

        return rooms;
    }

    private List<RoomEntity> queryRooms(String where, String other, Username username, Map<String, ?> queryParams) {
        where = (where == null || where.equals("")) ? "(m.id IS NOT NULL OR r.visibility = 'PUBLIC')" : "(m.id IS NOT NULL OR r.visibility = 'PUBLIC') AND %s".formatted(where);
        try {
            return getRooms(username)
                    .where(where)
                    .other(other)
                    .executeForList(RowMappers::mapToRoomEntityWithMessages, queryParams);
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

    public Map<Long, Integer> getNotDownloadedYetNumberByRoomName(Username username) {

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("username", username.value());

        return queryHelper
                .forUser(username)
                .query("SELECT COUNT(*) not_downloaded_count, r.id")
                .join(DOWNLOAD_DATES_JOIN)
                .where(DOWNLOAD_DATES_WHERE_NULL)
                .other("GROUP BY r.id")
                .executeForMap(RowMappers::mapNotDownloadedMessagesCount, arguments);
    }
}
