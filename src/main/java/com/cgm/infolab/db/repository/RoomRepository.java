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
    private final RowMappers rowMappers;

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
                        "m.status message_status, " +
                        "u_other.id other_user_id, " +
                        "u_other.username other_username, " +
                        "u_other.description other_description, " +
                        "u_other.status other_status, " +
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
                    "WHERE (s.username = :username OR r.visibility='PUBLIC') %s " + // !!!!! HERE TO ADD WHERE CONDITIONS !!!!!
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
                        "CAST(NULL AS bigint) as room_id,  " +
                        "u.username as roomname,  " +
                        "NULL as visibility,  " +
                        "NULL username,  " +
                        "NULL sender_description,  " +
                        "NULL as message_id,  " +
                        "NULL as sent_at,  " +
                        "NULL as content,  " +
                        "NULL as message_status,  " +
                        "u.id other_user_id, " +
                        "u.username other_username,  " +
                        "u.description other_description,  " +
                        "NULL description,  " +
                        "u.description new_user_description," +
                        "u.status other_status " +
                    "FROM infolab.users u  " +
                    "WHERE u.username NOT IN (SELECT username FROM users_with_room) AND u.username <> :username ";

    public RoomRepository(QueryHelper queryHelper, DataSource dataSource, NamedParameterJdbcTemplate namedParameterJdbcTemplate, RowMappers rowMappers) {
        this.queryHelper = queryHelper;
        this.dataSource = dataSource;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.rowMappers = rowMappers;
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

    public Optional<RoomEntity> getByRoomNameComplete(RoomName roomName, Username username) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("username", username.value());
        arguments.put("roomName", roomName.value());
        try {
            return Optional.ofNullable(
                    namedParameterJdbcTemplate.queryForObject(
                            GET_EXISTING_ROOMS_QUERY.formatted("AND (r.roomname = :roomName)"),
                            arguments,
                            rowMappers::mapToRoomEntityWithMessages
                            )
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
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
                            .executeForObject(rowMappers::mapToRoomEntity, queryParams)
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
                            .executeForObject(rowMappers::mapToRoomEntity, queryParams)
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

    public RoomEntity getDownloadInfoAsEmptyRoom(RoomName roomName, Username username) throws IllegalArgumentException {

        RoomEntity room = getByRoomName(roomName, username).orElseThrow(() ->
                new IllegalArgumentException("The user username=\"%s\" does not have access to room roomName=\"%s\" or the room does not exist".formatted(username.value(), roomName.value())));

        List<RoomEntity> rooms = new ArrayList<>(List.of(RoomEntity.empty())); // needed to do so because else it would be an immutable list and it would not work
        rooms.get(0).setName(roomName);

        rooms = addDownloadInfoToRooms(rooms, username);

        return rooms.get(0);
    }

    public List<RoomEntity> getExistingRoomsAndUsersWithoutRoomAsRooms(Integer pageSize,
                                                                       CursorEnum beforeOrAfter,
                                                                       RoomCursor beforeOrAfterCursor,
                                                                       Username username) {
        return getExistingRoomsAndUsersWithoutRoomAsRooms(pageSize, beforeOrAfter, beforeOrAfterCursor, null, username);
    }

    public List<RoomEntity> getExistingRoomsAndUsersWithoutRoomAsRooms(Integer pageSize,
                                                                       CursorEnum beforeOrAfter,
                                                                       RoomCursor beforeOrAfterCursor,
                                                                       String nameToSearch,
                                                                       Username username) {

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("username", username.value());

        if (nameToSearch != null && !nameToSearch.isEmpty()) {
            arguments.put("nameToSearch", nameToSearch);
        } else {
            nameToSearch = "";
        }

        boolean shouldRoomsQueryRun = true;
        boolean shouldUsersQueryRun = false;

        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            shouldRoomsQueryRun = false;
            shouldUsersQueryRun = true;
        }

        List<RoomEntity> existingRooms = new ArrayList<>();
        List<RoomEntity> usersAsRooms = new ArrayList<>();

        if (pageSize == null) {
            pageSize = -1;
        }

        String beforeOrAfterConditionTimestamp = "<";
        String beforeOrAfterConditionDescriptions = ">";
        String ascOrDesc = "ASC";
        String invertedAscOrDesc = "DESC";
        String nullsLastOrFirst = "LAST";
        if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            beforeOrAfterConditionTimestamp = ">";
            beforeOrAfterConditionDescriptions = "<";
            ascOrDesc = "DESC";
            invertedAscOrDesc = "ASC";
            nullsLastOrFirst = "FIRST";
        }

        String whereConditionRooms = "";
        String whereConditionUsers = "";


        String likeRooms;
        String whereLikeRooms;
        String whereLikeUsers;

        if (nameToSearch.isEmpty()) {
            likeRooms = "";

            whereLikeRooms = "";
            whereLikeUsers = "";
        } else {
            likeRooms = "description ILIKE '%%' || :nameToSearch || '%%'";

            whereLikeRooms = "AND " + likeRooms;
            whereLikeUsers = "AND u.description ILIKE '%%' || :nameToSearch || '%%'";
        }

        if (beforeOrAfterCursor != null) {
            if (beforeOrAfterCursor.getCursorType().equals(RoomCursor.RoomCursorType.TIMESTAMP)) {
                whereConditionRooms = "sent_at %s :timestamp".formatted(beforeOrAfterConditionTimestamp);

                if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
                    shouldRoomsQueryRun = true;
                    shouldUsersQueryRun = false;
                } else {
                    whereConditionRooms = "(%s %s)".formatted(whereConditionRooms, "OR sent_at IS NULL");
                }

                whereConditionRooms = "WHERE %s %s".formatted(whereConditionRooms, whereLikeRooms);

                arguments.put("timestamp", (LocalDateTime) beforeOrAfterCursor.getCursor());
            } else if (beforeOrAfterCursor.getCursorType().equals(RoomCursor.RoomCursorType.DESCRIPTION_ROOM)) {

                if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
                    shouldRoomsQueryRun = true;
                    shouldUsersQueryRun = false;
                    whereConditionRooms = "WHERE (description %s :descriptionRoom OR sent_at IS NOT NULL)".formatted(beforeOrAfterConditionDescriptions);
                } else {
                    whereConditionRooms = "WHERE sent_at IS NULL AND description %s :descriptionRoom".formatted(beforeOrAfterConditionDescriptions);
                }

                whereConditionRooms = "%s %s".formatted(whereConditionRooms, whereLikeRooms);

                arguments.put("descriptionRoom", (String) beforeOrAfterCursor.getCursor());
            } else if (beforeOrAfterCursor.getCursorType().equals(RoomCursor.RoomCursorType.DESCRIPTION_USER)) {

                if (beforeOrAfter.equals(CursorEnum.PAGE_AFTER)) {
                    shouldRoomsQueryRun = false;
                    shouldUsersQueryRun = true;
                }
                whereConditionUsers = "AND u.description %s :descriptionUser %s".formatted(beforeOrAfterConditionDescriptions, whereLikeUsers);
                arguments.put("descriptionUser", (String) beforeOrAfterCursor.getCursor());
            }
        }

        if (!nameToSearch.isEmpty()) {
            if (whereConditionRooms.isEmpty()) whereConditionRooms = "WHERE %s".formatted(likeRooms);
            if (whereConditionUsers.isEmpty()) whereConditionUsers = whereLikeUsers;
        }

        String limit = "";
        if (pageSize > 0) {
            limit = "LIMIT :pageSize";
            arguments.put("pageSize", pageSize);
        } else {
            if (beforeOrAfter.equals(CursorEnum.PAGE_BEFORE))
                shouldRoomsQueryRun = true;
            else
                shouldUsersQueryRun = true;
        }

        if (!beforeOrAfter.equals(CursorEnum.PAGE_BEFORE)) {
            if (shouldRoomsQueryRun) {
                existingRooms = queryExistingRooms(beforeOrAfter, whereConditionRooms, invertedAscOrDesc, ascOrDesc, nullsLastOrFirst, limit, arguments);

                if (pageSize > 0 && existingRooms.size() < pageSize) {
                    shouldUsersQueryRun = true;
                    pageSize -= existingRooms.size();
                    arguments.replace("pageSize", pageSize);
                }
            }

            if (shouldUsersQueryRun) {
                usersAsRooms = queryUsersAsRooms(whereConditionUsers, ascOrDesc, limit, arguments);
            }
        } else {
            if (shouldUsersQueryRun) {
                usersAsRooms = queryUsersAsRooms(whereConditionUsers, ascOrDesc, limit, arguments);

                usersAsRooms = usersAsRooms
                        .stream()
                        .sorted(Comparator.comparing(RoomEntity::getDescription))
                        .toList();

                if (pageSize > 0 && usersAsRooms.size() < pageSize) {
                    shouldRoomsQueryRun = true;
                    pageSize -= usersAsRooms.size();
                    arguments.replace("pageSize", pageSize);
                }
            }

            if (shouldRoomsQueryRun) {
                existingRooms = queryExistingRooms(beforeOrAfter, whereConditionRooms, invertedAscOrDesc, ascOrDesc, nullsLastOrFirst, limit, arguments);
            }
        }

        List<RoomEntity> rooms = Stream.concat(existingRooms.stream(), usersAsRooms.stream()).collect(Collectors.toList());

        rooms = addDownloadInfoToRooms(rooms, username);

        return rooms;
    }

    private List<RoomEntity> queryUsersAsRooms(String whereCondition, String ascOrDesc, String limit, Map<String, Object> arguments) {
        return namedParameterJdbcTemplate
                .query("%s %s ORDER BY new_user_description %s %s"
                                .formatted(
                                        GET_USERS_PRINCIPAL_HAS_NOT_ROOM_WITH_QUERY,
                                        whereCondition,
                                        ascOrDesc,
                                        limit),
                        arguments,
                        rowMappers::mapToRoomEntityWithMessages);
    }

    private List<RoomEntity> queryExistingRooms(CursorEnum beforeOrAfter,
                                                String whereCondition,
                                                String ascOrDescTimestamp,
                                                String ascOrDescDescription,
                                                String nullsLastOrFirst,
                                                String limit,
                                                Map<String, Object> arguments) {

        List<RoomEntity> roomsFromDb = namedParameterJdbcTemplate
                .query("%s %s ORDER BY sent_at %s NULLS %s, description %s %s"
                                .formatted(
                                        GET_EXISTING_ROOMS_QUERY.formatted(""),
                                        whereCondition,
                                        ascOrDescTimestamp,
                                        nullsLastOrFirst,
                                        ascOrDescDescription,
                                        limit),
                        arguments, rowMappers::mapToRoomEntityWithMessages);

        if (!beforeOrAfter.equals(CursorEnum.NONE)) {

            List<RoomEntity> roomsWithMessages = roomsFromDb.stream().filter(roomEntity -> roomEntity.getMessages().get(0).getTimestamp() != null).toList();
            List<RoomEntity> roomsWithoutMessages = roomsFromDb.stream().filter(roomEntity -> roomEntity.getMessages().get(0).getTimestamp() == null).toList();

            roomsWithMessages = roomsWithMessages
                    .stream()
                    .sorted((room1, room2) -> -(room1.getMessages().get(0).getTimestamp()).compareTo(room2.getMessages().get(0).getTimestamp()))
                    .toList();

            roomsWithoutMessages = roomsWithoutMessages
                    .stream()
                    .sorted(Comparator.comparing(RoomEntity::getDescription))
                    .toList();

            roomsFromDb = Stream.concat(roomsWithMessages.stream(), roomsWithoutMessages.stream()).collect(Collectors.toList());
        }
        return roomsFromDb;
    }

    private List<RoomEntity> addDownloadInfoToRooms(List<RoomEntity> rooms, Username username) {
        if (rooms.isEmpty()) {
            return rooms;
        }

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
                .executeForMap(rowMappers::mapNotDownloadedMessagesCount, arguments);
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
                .executeForMap(rowMappers::mapLastDownloadedDate, arguments);
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
