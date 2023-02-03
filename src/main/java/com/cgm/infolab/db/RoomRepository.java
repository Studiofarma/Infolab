package com.cgm.infolab.db;

import com.cgm.infolab.model.Room;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Component
public class RoomRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    private final Logger log = LoggerFactory.getLogger(RoomRepository.class);

    public RoomRepository(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    /**
     * Metodo che aggiunge una stanza al database.
     * @return chiave che è stata auto generata per la stanza creata, oppure -1 se la stanza inserita esisteva già.
     */
    public long add(Room room) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("rooms")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("roomname", room.getName());

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room %s already exists in the database.", room.getName()));
        }
        return -1;
    }

    /**
     * Metodo che risale all'id di una room dal suo nome
     * @param room da cui risalire all'id
     * @return id della room con il nome passato a parametro. -1 in caso la room non esista.
     */
    public long readId(Room room) {
        String query = "SELECT id FROM infolab.rooms WHERE roomname = ?";
        long roomId;
        try {
            roomId = jdbcTemplate.queryForObject(
                    query, new Object[] {room.getName()}, Long.class);
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("La room con nome = %s non esiste", room.getName()));
            roomId = -1;
        }

        return roomId;
    }
}
