package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import org.springframework.context.annotation.Lazy;
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

    private final String ROOMS_QUERY = "SELECT r.id, r.roomname FROM infolab.rooms r ";
    private final String ROOMS_DISTINCT_ON_QUERY = "SELECT DISTINCT ON (r.roomname) r.roomname, " +
                                                    "m.id, m.sender_id, m.recipient_room_id, m.sent_at, m.\"content\" " +
                                                    "FROM infolab.chatmessages m " +
                                                    "LEFT JOIN infolab.rooms r " +
                                                    "ON r.id = m.recipient_room_id %s " + // Questo è per aggiungere condizioni all'on
                                                    "%s " + // Questo è per aggiungere WHERE
                                                    "order by r.roomname, sent_at desc ";
    private final String ACCESS_CONDITION_QUERY =
            "(r.roomname LIKE ? || '-%' OR r.roomname LIKE '%-' || ? OR r.roomname = 'general')";
    private final String WHERE_ACCESS_CONDITION_QUERY =
            "WHERE " + ACCESS_CONDITION_QUERY;

    public RoomRepository(JdbcTemplate jdbcTemplate,
                          DataSource dataSource,
                          /*è accettabile utilizzarlo per risolvere una circular reference?*/@Lazy ChatMessageRepository chatMessageRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.chatMessageRepository = chatMessageRepository;
    }

    /**
     * Metodo che aggiunge una stanza al database.
     * @return chiave che è stata auto generata per la stanza creata, oppure -1 se la stanza inserita esisteva già.
     */
    public long add(RoomEntity room) throws DuplicateKeyException {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("rooms")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", room.getName());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che risale all'id di una room dal suo nome
     * @param roomName da cui risalire all'id
     * @return id della room con il nome passato a parametro. -1 in caso la room non esista.
     */
    public Optional<RoomEntity> getByRoomName(String roomName, String username) {
        if (roomName.equals("general") || roomName.contains(username + "-") || roomName.contains("-" + username))
            return queryRoom(String.format("%s WHERE roomname = ?", ROOMS_QUERY), roomName);

        return Optional.empty();
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id, String username) {
        return queryRoom(String.format("%s WHERE id = ? AND %s", ROOMS_QUERY, ACCESS_CONDITION_QUERY), id, username, username);
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

    public List<RoomEntity> getAllWhereLastMessageNotNull(String username) {
        return queryRooms(addConditionToRoomsDistinctOnQuery(""), username, username);
    }

    public List<RoomEntity> getAfterDate(LocalDate dateLimit, String username) {
        if (dateLimit == null) {
            return getAllWhereLastMessageNotNull(username);
        }

        return queryRooms(addConditionToRoomsDistinctOnQuery("AND m.sent_at > ?"), dateLimit, username, username);
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
        RoomEntity room = RoomEntity.of(rs.getString("roomname"));
        room.setId(rs.getLong("id"));
        return room;
    }

    private RoomEntity mapToEntityWithMessages(ResultSet rs, int rowNum) throws SQLException {
        RoomEntity room = RoomEntity.of(rs.getString("roomname"));
        room.setId(rs.getLong("id"));

        // Qui invece di usare la repository avrei dovuto estrarre il metodo nel service e usare quello?
        ChatMessageEntity message = chatMessageRepository.mapToEntity(rs, rowNum);
        room.setMessages(List.of(message));
        return room;
    }

    private String addConditionToRoomsDistinctOnQuery(String onCondition) {
        return String.format(ROOMS_DISTINCT_ON_QUERY, onCondition, WHERE_ACCESS_CONDITION_QUERY);
    }
}
