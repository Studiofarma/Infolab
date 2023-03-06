package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.RoomEntity;
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

    private final String ROOMS_QUERY = "SELECT r.id, r.roomname FROM infolab.rooms r";
    private final String ROOMS_DISTINCT_ON_QUERY = "SELECT DISTINCT ON (r.roomname) r.roomname, m.sent_at, m.\"content\"" +
            "FROM infolab.chatmessages m" +
            "LEFT JOIN infolab.rooms r" +
            "ON r.id = m.recipient_room_id %s" +
            "order by r.roomname, sent_at desc";

    public RoomRepository(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
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
    public Optional<RoomEntity> getByRoomName(String roomName) {
        return queryRoom(String.format("%s WHERE roomname = ?", ROOMS_QUERY), roomName);
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id) {
        return queryRoom(String.format("%s WHERE id = ?", ROOMS_QUERY), id);
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

    public List<RoomEntity> getAll() {
        return queryRooms(ROOMS_QUERY);
    }

    public List<RoomEntity> getAllWhereLastMessageNotNull() {
        return queryRooms(String.format("%s %s", ROOMS_QUERY, addConditionToRoomsDistinctOnQuery("")));
    }

    public List<RoomEntity> getAfterDate(LocalDate dateLimit) {
        if (dateLimit == null) {
            return getAllWhereLastMessageNotNull();
        }

        return queryRooms(
                String.format("%s %s", ROOMS_QUERY, addConditionToRoomsDistinctOnQuery("AND m.sent_at > ?")), dateLimit);
    }

    private List<RoomEntity> queryRooms(String query, Object... queryParams) {
        try {
            return jdbcTemplate.query(query, this::mapToEntity, queryParams);
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

    private String addConditionToRoomsDistinctOnQuery(String condition) {
        return String.format(ROOMS_DISTINCT_ON_QUERY, condition);
    }
}
