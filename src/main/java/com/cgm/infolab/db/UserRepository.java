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
import java.util.HashMap;
import java.util.Map;

@Component
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    private final Logger log = LoggerFactory.getLogger(UserRepository.class);

    public UserRepository(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    /**
     * Metodo che aggiunge un utente al database.
     * @param user utente da salvare sul database.
     * @return chiave che è stata auto generata per l'utente creato, oppure -1 se l'utente inserito esisteva già.
     */
    public long add(UserEntity user) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("users")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("username", user.getName());

        try {
            return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
        } catch (DuplicateKeyException e) {
            log.info(String.format("User %s already exists in the database.", user.getName()));
        }
        return -1;
    }

    private final RowMapper<UserEntity> rowMapper = (rs, rowNum) -> {
        UserEntity user = UserEntity.of(rs.getString("username"));
        user.setId(rs.getLong("id"));
        return user;
    };

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username da cui risalire all'id
     * @return id dell'utente con il nome passato a parametro. -1 in caso l'utente non esista.
     */
    public UserEntity getByUsername(String username) { // TODO: usare Optional
        String query = "SELECT * FROM infolab.users WHERE username = ?";
        try {
            return jdbcTemplate.queryForObject(
                    query, rowMapper, username);
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("L'user con nome = %s non esiste", username));
        }
        return null;
    }

    /**
     * Metodo che ritorna un utente dal database, ricavandolo dall'id
     * @param id da cui risalire all'utente
     * @return oggetto User con il nome preso dal db. Ritorna null se l'user non esiste.
     */
    public UserEntity getById(long id) { // TODO: aggiungere Optional
        String query = "SELECT * FROM infolab.users WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(
                    query, rowMapper, id);
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("L'user con id = %d non esiste", id));
        }
        return null;
    }
}
