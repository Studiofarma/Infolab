package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enums.Username;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import com.cgm.infolab.db.repository.queryhelper.QueryResult;
import com.cgm.infolab.db.repository.queryhelper.UserQueryResult;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
                "ELSE u_other.description " +
            "END AS description";
    private final String JOIN = "left join infolab.rooms_subscriptions s_other on r.id = s_other.room_id and s_other.user_id <> s.user_id " +
            "left join infolab.users u_other on u_other.id = s_other.user_id";

    private final String ROOMS_AND_LAST_MESSAGES_OTHER = "ORDER BY r.roomname, m.sent_at DESC";

    private final String GET_DOWNLOAD_DATES_FROM = "infolab.chatmessages m";
    private final String GET_DOWNLOAD_DATES_INNER_JOIN = "join infolab.download_dates d on d.message_id = m.id";
    private final String GET_DOWNLOAD_DATES_WHERE_IN_LIST = "m.recipient_room_id IN (:roomIds)";

    public RoomRepository(QueryHelper queryHelper, DataSource dataSource) {
        this.queryHelper = queryHelper;
        this.dataSource = dataSource;
    }

    public RoomEntity add(RoomEntity room) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("rooms")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", room.getName().value());
        parameters.put("visibility", room.getVisibility().name());
        parameters.put("description", room.getDescription());
        return RoomEntity.of(
                (long)simpleJdbcInsert.executeAndReturnKey(parameters),
                room.getName(),
                room.getVisibility(),
                room.getRoomType(),
                room.getDescription(),
                room.getMessages(),
                room.getOtherParticipants()
        );
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

        List<Long> roomIds = extractRoomIdsFromRoomList(rooms);

        Map<Long, Integer> notDownloadedCountsList = getNotDownloadedYetNumberGroupedByRoom(roomIds);
        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        Map<Long, LocalDateTime> lastDownloadedDatesList = getLastDownloadedDatesGroupedByRoom(roomIds);
        rooms = mergeRoomsAndLastDownloadedDate(rooms, lastDownloadedDatesList);

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

        List<Long> roomIds = extractRoomIdsFromRoomList(rooms);

        Map<Long, Integer> notDownloadedCountsList = getNotDownloadedYetNumberGroupedByRoom(roomIds);
        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        Map<Long, LocalDateTime> lastDownloadedDatesList = getLastDownloadedDatesGroupedByRoom(roomIds);
        rooms = mergeRoomsAndLastDownloadedDate(rooms, lastDownloadedDatesList);

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

    private List<RoomEntity> mergeRoomsAndLastDownloadedDate(List<RoomEntity> rooms, Map<Long, LocalDateTime> notDownloadedDatesList) {
        rooms.forEach(room -> {
            LocalDateTime timestamp = notDownloadedDatesList.get(room.getId());

            room.setLastDownloadedDate(timestamp);

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
                        "r.visibility, u_mex.id user_id, u_mex.username username, m.id message_id, m.sent_at, m.content, m.sender_id, m.status, " +
                        "u_other.id other_user_id, u_other.username other_username, u_other.description other_description, %s".formatted(CASE_QUERY))
                .join("LEFT JOIN infolab.chatmessages m ON r.id = m.recipient_room_id LEFT JOIN infolab.users u_mex ON u_mex.id = m.sender_id " +
                        "left join infolab.rooms_subscriptions s_other on r.id = s_other.room_id and s_other.user_id <> s.user_id " +
                        "left join infolab.users u_other on u_other.id = s_other.user_id");
    }

    public Map<Long, Integer> getNotDownloadedYetNumberGroupedByRoom(List<Long> roomIds) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomIds", roomIds);

        return queryHelper
                .query("SELECT COUNT(*) not_downloaded_count, m.recipient_room_id id")
                .from(GET_DOWNLOAD_DATES_FROM)
                .join("left %s".formatted(GET_DOWNLOAD_DATES_INNER_JOIN))
                .where("%s and %s".formatted(GET_DOWNLOAD_DATES_WHERE_IN_LIST, DOWNLOAD_DATES_WHERE_NULL))
                .other("GROUP BY m.recipient_room_id")
                .executeForMap(RowMappers::mapNotDownloadedMessagesCount, arguments);
    }

    public Map<Long, LocalDateTime> getLastDownloadedDatesGroupedByRoom(List<Long> roomIds) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomIds", roomIds);

        return queryHelper
                .query("SELECT DISTINCT ON (m.recipient_room_id) d.download_timestamp, m.recipient_room_id id")
                .from(GET_DOWNLOAD_DATES_FROM)
                .join(GET_DOWNLOAD_DATES_INNER_JOIN)
                .where(GET_DOWNLOAD_DATES_WHERE_IN_LIST)
                .other("order by m.recipient_room_id, d.download_timestamp desc")
                .executeForMap(RowMappers::mapLastDownloadedDate, arguments);
    }

    private List<Long> extractRoomIdsFromRoomList(List<RoomEntity> rooms) {
        List<Long> roomIds = new ArrayList<>();

        rooms.forEach((roomEntity -> roomIds.add(roomEntity.getId())));

        return roomIds;
    }
}
