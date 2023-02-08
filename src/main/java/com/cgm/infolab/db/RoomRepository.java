package com.cgm.infolab.db;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class RoomRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

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
        String query = "SELECT * FROM infolab.rooms WHERE roomname = ?";

        return Optional.ofNullable(jdbcTemplate.queryForObject(
                    query, RoomRepository::rowMapper, roomName));
    }

    /**
     * Metodo che ritorna una room dal database, ricavandolo dall'id
     * @param id da cui risalire alla room
     * @return oggetto Room con il nome preso dal db. Ritorna null se la room non esiste.
     */
    public Optional<RoomEntity> getById(long id) {
        String query = "SELECT * FROM infolab.rooms WHERE id = ?";

        return Optional.ofNullable(jdbcTemplate.queryForObject(
                query, RoomRepository::rowMapper, id));
    }

    /**
     * Rowmapper utilizzato nei metodi getByRoomName e getById
     */
    private static RoomEntity rowMapper(ResultSet rs, int rowNum) throws SQLException {
        RoomEntity room = RoomEntity.of(rs.getString("roomname"));
        room.setId(rs.getLong("id"));
        return room;
    }
}
