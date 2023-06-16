package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;
    private final QueryHelper queryHelper;
    private final DataSource dataSource;
    private final String USERS_SELECT = "SELECT *";
    private final String USERS_FROM = "infolab.users";
    private final String USERS_WHERE_ID = "id = :userId";
    private final String USERS_WHERE_USERNAME = "username = :username";


    public UserRepository(JdbcTemplate jdbcTemplate, QueryHelper queryHelper, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.queryHelper = queryHelper;
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
        Map<String, Object> map = new HashMap<>();
        map.put("username", username.value());

        return queryUser2(USERS_SELECT, USERS_FROM, USERS_WHERE_USERNAME, map);
    }

    /**
     * Metodo che ritorna un utente dal database, ricavandolo dall'id
     * @param id da cui risalire all'utente
     * @return oggetto User con il nome preso dal db. Ritorna null se l'user non esiste.
     */
    public Optional<UserEntity> getById(long id) {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", id);

        return queryUser2(USERS_SELECT, USERS_FROM, USERS_WHERE_ID, map);
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

    private Optional<UserEntity> queryUser2(String select, String from, String where, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    queryHelper
                            .query(select)
                            .from(from)
                            .where(where)
                            .executeForObject(this::mapToEntity, queryParams)
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
                Username.of(rs.getString("username")));
    }
}
