package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.CursorEnum;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import com.cgm.infolab.db.repository.queryhelper.QueryResult;
import com.cgm.infolab.db.repository.queryhelper.UserQueryResult;
import com.cgm.infolab.model.RoomCursor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.cgm.infolab.db.repository.DownloadDateRepository.*;

@Component
public class RoomRepository {
    private final QueryHelper queryHelper;
    private final DataSource dataSource;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    private final String ROOMS_WHERE_ROOMNAME = "r.roomname = :roomName";
    private final String CASE_QUERY =
            "CASE " +
                "WHEN r.visibility = 'PUBLIC' THEN r.description " +
                "ELSE u_other.description " +
            "END AS description";
    private final String JOIN = "left join infolab.rooms_subscriptions s_other on r.roomname = s_other.roomname and s_other.username <> s.username " +
            "left join infolab.users u_other on u_other.username = s_other.username";

    private final String ROOMS_AND_LAST_MESSAGES_OTHER = "ORDER BY r.roomname, m.sent_at DESC";
    private final String ROOMS_WHERE_NOT_NULL_OR_PUBLIC = "(m.id IS NOT NULL OR r.visibility = 'PUBLIC')";

    private final String GET_DOWNLOAD_DATES_FROM = "infolab.chatmessages m";
    private final String GET_DOWNLOAD_DATES_INNER_JOIN = "join infolab.download_dates d on d.message_id = m.id and d.username = :username";
    private final String GET_DOWNLOAD_DATES_WHERE_IN_LIST = "m.recipient_room_name IN (:roomNames)";

    private final String GET_EXISTING_ROOMS_QUERY =
            "WITH not_ordered_result as" +
                    " ( " +
                    "SELECT DISTINCT ON (r.roomname) " +
                        "r.id room_id, " +
                        "r.roomname, " +
                        "r.visibility, " +
                        "m.sender_name username, " +
                        "u_mex.description sender_description, " +
                        "m.id message_id, " +
                        "m.sent_at, " +
                        "m.content, " +
                        "m.status, " +
                        "u_other.id other_user_id, " +
                        "u_other.username other_username, " +
                        "u_other.description other_description, " +
                        "CASE " +
                            "WHEN r.visibility = 'PUBLIC' THEN r.description " +
                            "ELSE u_other.description " +
                        "END AS description, null new_user_description " +
                    "FROM infolab.rooms r " +
                    "LEFT JOIN infolab.rooms_subscriptions s ON r.roomname = s.roomname " +
                    "LEFT JOIN infolab.chatmessages m ON r.roomname = m.recipient_room_name " +
                    "LEFT JOIN infolab.users u_mex ON u_mex.username = m.sender_name " +
                    "LEFT JOIN infolab.rooms_subscriptions s_other ON r.roomname = s_other.roomname and s_other.username <> s.username " +
                    "LEFT JOIN infolab.users u_other ON u_other.username = s_other.username " +
                    "WHERE (s.username = :username OR r.visibility='PUBLIC') " +
                    "ORDER BY r.roomname, m.sent_at DESC " +
                    ") " +
                    "SELECT * FROM not_ordered_result ";

    private final String GET_USERS_PRINCIPAL_HAS_NOT_ROOM_WITH_QUERY =
            "WITH users_with_room as  " +
                    "(  " +
                    "SELECT s2.username  " +
                    "FROM infolab.rooms_subscriptions s1  " +
                    "JOIN infolab.rooms_subscriptions s2 ON s2.roomname = s1.roomname and s2.username <> s1.username  " +
                    "WHERE s1.username = :username" +
                    ")  " +
                    "SELECT  " +
                        "NULL as room_id,  " +
                        "u.username as roomname,  " +
                        "NULL as visibility,  " +
                        "NULL username,  " +
                        "NULL sender_description,  " +
                        "NULL as message_id,  " +
                        "NULL as sent_at,  " +
                        "NULL as content,  " +
                        "NULL as status,  " +
                        "u.id other_user_id,  " +
                        "u.username other_username,  " +
                        "u.description other_description,  " +
                        "NULL description,  " +
                        "u.description new_user_description  " +
                    "FROM infolab.users u  " +
                    "WHERE u.username NOT IN (SELECT username FROM users_with_room) AND u.username <> :username ";

    public RoomRepository(QueryHelper queryHelper, DataSource dataSource, NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.queryHelper = queryHelper;
        this.dataSource = dataSource;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
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
        return  queryRoom("r.id = :roomId", username, arguments);
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
                .join("left join infolab.rooms_subscriptions s on r.roomname = s.roomname %s".formatted(JOIN));
    }

    public List<RoomEntity> getExistingRoomsAndUsersWithoutRoomAsRooms(Integer pageSize,
                                                                       CursorEnum beforeOrAfter,
                                                                       RoomCursor beforeOrAfterCursor,
                                                                       Username username) {

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("username", username.value());

        boolean shouldFirstQueryRun = true;
        boolean shouldSecondQueryRun = false;

        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            shouldFirstQueryRun = false;
            shouldSecondQueryRun = true;
        }

        List<RoomEntity> roomsFirst = new ArrayList<>();
        List<RoomEntity> roomsSecond = new ArrayList<>();

        if (pageSize == null) {
            pageSize = -1;
        }


        String beforeOrAfterConditionTimestamp = "<"; // TODO: remove assignment
        String beforeOrAfterConditionDescriptions = ">"; // TODO: remove assignment
        String ascOrDesc = "ASC"; // TODO: remove assignment
        String invertedAscOrDesc = "DESC";
        String nullsLastOrFirst = "LAST";
        if (beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
            beforeOrAfterConditionTimestamp = "<";
            beforeOrAfterConditionDescriptions = ">";
            ascOrDesc = "ASC";
            invertedAscOrDesc = "DESC";
            nullsLastOrFirst = "LAST";
        } else if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            beforeOrAfterConditionTimestamp = ">";
            beforeOrAfterConditionDescriptions = "<";
            ascOrDesc = "DESC";
            invertedAscOrDesc = "ASC";
            nullsLastOrFirst = "FIRST";
        }

        String whereConditionFirst = "";
        String whereConditionSecond = "";
        if (beforeOrAfterCursor != null) {
            if (beforeOrAfterCursor.getCursorType().equals(RoomCursor.RoomCursorType.TIMESTAMP)) {
                if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
                    shouldFirstQueryRun = true;
                    shouldSecondQueryRun = false;
                    whereConditionFirst = "WHERE sent_at %s :timestamp".formatted(beforeOrAfterConditionTimestamp);
                } else {
                    whereConditionFirst = "WHERE sent_at %s :timestamp or sent_at IS NULL".formatted(beforeOrAfterConditionTimestamp);
                }
                arguments.put("timestamp", (LocalDateTime) beforeOrAfterCursor.getCursor());
            } else if (beforeOrAfterCursor.getCursorType().equals(RoomCursor.RoomCursorType.DESCRIPTION_ROOM)) {
                if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
                    shouldFirstQueryRun = true;
                    shouldSecondQueryRun = false;
                    whereConditionFirst = "WHERE (description %s :descriptionRoom OR sent_at IS NOT NULL)".formatted(beforeOrAfterConditionDescriptions);
                } else {
                    whereConditionFirst = "WHERE sent_at IS NULL and description %s :descriptionRoom".formatted(beforeOrAfterConditionDescriptions);
                }
                arguments.put("descriptionRoom", (String) beforeOrAfterCursor.getCursor());
            } else if (beforeOrAfterCursor.getCursorType().equals(RoomCursor.RoomCursorType.DESCRIPTION_USER)) {
                if (beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
                    shouldFirstQueryRun = false;
                    shouldSecondQueryRun = true;
                }
                whereConditionSecond = "AND u.description %s :descriptionUser".formatted(beforeOrAfterConditionDescriptions);
                arguments.put("descriptionUser", (String) beforeOrAfterCursor.getCursor());
            }
        }


        String limit = "";
        if (pageSize > 0) {
            limit = "LIMIT :pageSize";
            arguments.put("pageSize", pageSize);
        } else {
            if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE))
                shouldFirstQueryRun = true;
            else
                shouldSecondQueryRun = true;
        }

        if (!beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            if (shouldFirstQueryRun) {
                roomsFirst = queryExistingRooms(beforeOrAfter, whereConditionFirst, invertedAscOrDesc, ascOrDesc, nullsLastOrFirst, limit, arguments);

                if (pageSize > 0 && roomsFirst.size() < pageSize) {
                    shouldSecondQueryRun = true;
                    pageSize -= roomsFirst.size();
                    arguments.replace("pageSize", pageSize);
                }
            }

            if (shouldSecondQueryRun) {
                roomsSecond = queryUsersAsRooms(whereConditionSecond, ascOrDesc, limit, arguments);
            }
        } else {
            if (shouldSecondQueryRun) {
                roomsSecond = queryUsersAsRooms(whereConditionSecond, ascOrDesc, limit, arguments);

                roomsSecond = roomsSecond
                        .stream()
                        .sorted(Comparator.comparing(RoomEntity::getDescription))
                        .toList();

                if (pageSize > 0 && roomsSecond.size() < pageSize) {
                    shouldFirstQueryRun = true;
                    pageSize -= roomsSecond.size();
                    arguments.replace("pageSize", pageSize);
                }
            }

            if (shouldFirstQueryRun) {
                roomsFirst = queryExistingRooms(beforeOrAfter, whereConditionFirst, invertedAscOrDesc, ascOrDesc, nullsLastOrFirst, limit, arguments);
            }
        }

        List<RoomEntity> rooms = Stream.concat(roomsFirst.stream(), roomsSecond.stream()).collect(Collectors.toList());

        List<RoomName> roomNames = extractRoomNamesFromRoomList(rooms);

        Map<RoomName, Integer> notDownloadedCountsList = getNotDownloadedYetNumberGroupedByRoom(roomNames, username);
        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        Map<RoomName, LocalDateTime> lastDownloadedDatesList = getLastDownloadedDatesGroupedByRoom(roomNames, username);
        rooms = mergeRoomsAndLastDownloadedDate(rooms, lastDownloadedDatesList);

        return rooms;
    }

    private List<RoomEntity> queryUsersAsRooms(String whereConditionSecond, String ascOrDesc, String limit, Map<String, Object> arguments) {
        List<RoomEntity> roomsSecond;

        String query = "%s %s ORDER BY new_user_description %s %s"
                .formatted(
                        GET_USERS_PRINCIPAL_HAS_NOT_ROOM_WITH_QUERY,
                        whereConditionSecond,
                        ascOrDesc,
                        limit);

        System.out.println(query);

        roomsSecond = namedParameterJdbcTemplate
                .query(query,
                        arguments,
                        RowMappers::mapToRoomEntityWithMessages2);
        return roomsSecond;
    }

    private List<RoomEntity> queryExistingRooms(CursorEnum beforeOrAfter, String whereConditionFirst, String invertedAscOrDesc, String ascOrDesc, String nullsLastOrFirst, String limit, Map<String, Object> arguments) {
        List<RoomEntity> roomsFirst;

        String query = "%s %s ORDER BY sent_at %s NULLS %s, description %s %s"
                .formatted(
                        GET_EXISTING_ROOMS_QUERY,
                        whereConditionFirst,
                        invertedAscOrDesc,
                        nullsLastOrFirst,
                        ascOrDesc,
                        limit);

        System.out.println(query);

        roomsFirst = namedParameterJdbcTemplate
                .query(query,
                        arguments, RowMappers::mapToRoomEntityWithMessages2);

        if (!beforeOrAfter.equals(CursorEnum.NONE)) {

            List<RoomEntity> roomsWithMessages = roomsFirst.stream().filter(roomEntity -> roomEntity.getMessages().get(0).getTimestamp() != null).toList();
            List<RoomEntity> roomsWithoutMessages = roomsFirst.stream().filter(roomEntity -> roomEntity.getMessages().get(0).getTimestamp() == null).toList();

            roomsWithMessages = roomsWithMessages
                    .stream()
                    .sorted((room1, room2) -> -(room1.getMessages().get(0).getTimestamp()).compareTo(room2.getMessages().get(0).getTimestamp()))
                    .toList();

            roomsWithoutMessages = roomsWithoutMessages
                    .stream()
                    .sorted(Comparator.comparing(RoomEntity::getDescription))
                    .toList();

            roomsFirst = Stream.concat(roomsWithMessages.stream(), roomsWithoutMessages.stream()).collect(Collectors.toList());
        }
        return roomsFirst;
    }

    public List<RoomEntity> getAllRoomsAndLastMessageEvenIfNullInPublicRooms(Username username) {
        List<RoomEntity> rooms = queryRooms(null, ROOMS_AND_LAST_MESSAGES_OTHER, username, new HashMap<>());

        List<RoomName> roomNames = extractRoomNamesFromRoomList(rooms);

        Map<RoomName, Integer> notDownloadedCountsList = getNotDownloadedYetNumberGroupedByRoom(roomNames, username);
        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        Map<RoomName, LocalDateTime> lastDownloadedDatesList = getLastDownloadedDatesGroupedByRoom(roomNames, username);
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

        List<RoomName> roomNames = extractRoomNamesFromRoomList(rooms);

        Map<RoomName, Integer> notDownloadedCountsList = getNotDownloadedYetNumberGroupedByRoom(roomNames, username);
        rooms = mergeRoomsAndNotDownloadedCount(rooms, notDownloadedCountsList);

        Map<RoomName, LocalDateTime> lastDownloadedDatesList = getLastDownloadedDatesGroupedByRoom(roomNames, username);
        rooms = mergeRoomsAndLastDownloadedDate(rooms, lastDownloadedDatesList);

        return rooms;
    }

    private List<RoomEntity> mergeRoomsAndNotDownloadedCount(List<RoomEntity> rooms, Map<RoomName, Integer> notDownloadedCountsList) {
        rooms.forEach(room -> {
            Integer countObj = notDownloadedCountsList.get(room.getName());
            int count = countObj == null ? 0 : countObj;

            room.setNotDownloadedMessagesCount(count);

            rooms.set(rooms.indexOf(room), room);
        });

        return rooms;
    }

    private List<RoomEntity> mergeRoomsAndLastDownloadedDate(List<RoomEntity> rooms, Map<RoomName, LocalDateTime> notDownloadedDatesList) {
        rooms.forEach(room -> {
            LocalDateTime timestamp = notDownloadedDatesList.get(room.getName());

            room.setLastDownloadedDate(timestamp);

            rooms.set(rooms.indexOf(room), room);
        });

        return rooms;
    }

    private List<RoomEntity> queryRooms(String where, String other, Username username, Map<String, ?> queryParams) {
        where = (where == null || where.isEmpty()) ? ROOMS_WHERE_NOT_NULL_OR_PUBLIC : "%s AND %s".formatted(ROOMS_WHERE_NOT_NULL_OR_PUBLIC, where);
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
                .query("SELECT DISTINCT ON (r.roomname) r.id room_id, r.roomname roomname, " +
                        "r.visibility, m.sender_name username, u.description sender_description, m.id message_id, m.sent_at, m.content, m.status, " +
                        "u_other.id other_user_id, u_other.username other_username, u_other.description other_description, %s".formatted(CASE_QUERY))
                .join("LEFT JOIN infolab.chatmessages m ON r.roomname = m.recipient_room_name " +
                        "left join infolab.users u ON u.username = m.sender_name " +
                        "left join infolab.rooms_subscriptions s_other on r.roomname = s_other.roomname and s_other.username <> s.username " +
                        "left join infolab.users u_other on u_other.username = s_other.username");
    }

    public Map<RoomName, Integer> getNotDownloadedYetNumberGroupedByRoom(List<RoomName> roomNames, Username username) {
        List<String> roomNamesStrings = new ArrayList<>();
        roomNames.forEach(roomName -> roomNamesStrings.add(roomName.value()));

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomNames", roomNamesStrings);
        arguments.put("username", username.value());

        return queryHelper
                .query("SELECT COUNT(*) not_downloaded_count, m.recipient_room_name roomname")
                .from(GET_DOWNLOAD_DATES_FROM)
                .join("left %s".formatted(GET_DOWNLOAD_DATES_INNER_JOIN))
                .where("%s and %s".formatted(GET_DOWNLOAD_DATES_WHERE_IN_LIST, DOWNLOAD_DATES_WHERE_NULL))
                .other("GROUP BY m.recipient_room_name")
                .executeForMap(RowMappers::mapNotDownloadedMessagesCount, arguments);
    }

    public Map<RoomName, LocalDateTime> getLastDownloadedDatesGroupedByRoom(List<RoomName> roomNames, Username username) {
        List<String> roomNamesStrings = new ArrayList<>();
        roomNames.forEach(roomName -> roomNamesStrings.add(roomName.value()));

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("roomNames", roomNamesStrings);
        arguments.put("username", username.value());

        return queryHelper
                .query("SELECT DISTINCT ON (m.recipient_room_name) d.download_timestamp, m.recipient_room_name roomname")
                .from(GET_DOWNLOAD_DATES_FROM)
                .join(GET_DOWNLOAD_DATES_INNER_JOIN)
                .where(GET_DOWNLOAD_DATES_WHERE_IN_LIST)
                .other("order by m.recipient_room_name, d.download_timestamp desc")
                .executeForMap(RowMappers::mapLastDownloadedDate, arguments);
    }

    private List<RoomName> extractRoomNamesFromRoomList(List<RoomEntity> rooms) {
        List<RoomName> roomNames = new ArrayList<>();

        rooms.forEach(roomEntity -> {
            if(roomEntity.getName() != null)
                roomNames.add(roomEntity.getName());
        });

        return roomNames;
    }
}
