package com.cgm.infolab.db;

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

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param user da cui risalire all'id
     * @return id dell'utente con il nome passato a parametro. -1 in caso l'utente non esista.
     */
    public long readId(UserEntity user) {
        String query = "SELECT id FROM infolab.users WHERE username = ?";
        try {
            return jdbcTemplate.queryForObject(
                    query, Long.class, user.getName());
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("L'user con nome = %s non esiste", user.getName()));
        }
        return -1;
    }

    /**
     * Metodo che ritorna un utente dal database, ricavandolo dall'id
     * @param id da cui risalire all'utente
     * @return oggetto User con il nome preso dal db. Ritorna null se l'user non esiste.
     */
    public UserEntity getById(long id) {
        String query = "SELECT username FROM infolab.users WHERE id = ?";
        try {
            return new UserEntity(jdbcTemplate.queryForObject(
                    query, String.class, id));
        } catch (EmptyResultDataAccessException e) {
            log.info(String.format("L'user con id = %d non esiste", id));
        }
        return null;
    }
}
