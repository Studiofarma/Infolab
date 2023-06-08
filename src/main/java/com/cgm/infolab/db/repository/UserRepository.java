package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final String USERS_QUERY = "SELECT * FROM infolab.users";

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
        parameters.put("username", user.getName().value());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username da cui risalire all'id
     * @return id dell'utente con il nome passato a parametro. -1 in caso l'utente non esista.
     */
    public Optional<UserEntity> getByUsername(Username username) {
        return queryUser(String.format("%s WHERE username = ?", USERS_QUERY), username.value());
    }

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username da cui risalire agli users
     * @return una lista di users.
     */
    public List<UserEntity> getByUsernameWithLike(String username) {
        return queryUsers(String.format("%s WHERE username ILIKE ? || ? LIMIT 5", USERS_QUERY) , username, "%");
    }

    private List<UserEntity> queryUsers(String query, String username, String wildCard) {
        try {
            return jdbcTemplate.query(query, this::mapToEntity, username, wildCard);
        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    /**
     * Metodo che ritorna un utente dal database, ricavandolo dall'id
     * @param id da cui risalire all'utente
     * @return oggetto User con il nome preso dal db. Ritorna null se l'user non esiste.
     */
    public Optional<UserEntity> getById(long id) {
        return queryUser(String.format("%s WHERE id = ?", USERS_QUERY), id);
    }

    private Optional<UserEntity> queryUser(String query, Object... objects) {
        try {
            return Optional.ofNullable(
                    jdbcTemplate.queryForObject(query, this::mapToEntity, objects)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Rowmapper utilizzato nei metodi getByUsername e getById
     */
    private UserEntity mapToEntity(ResultSet rs, int rowNum) throws SQLException {
        return UserEntity.of(rs.getLong("id"),
                Username.of(rs.getString("username")),
                rs.getString("description"));
    }
}
