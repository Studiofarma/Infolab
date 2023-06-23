package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.queryhelper.QueryHelper;
import com.cgm.infolab.db.repository.queryhelper.QueryResult;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.*;

@Component
public class UserRepository {
    private final QueryHelper queryHelper;
    private final DataSource dataSource;


    public UserRepository(QueryHelper queryHelper, DataSource dataSource) {
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
        parameters.put("description", user.getDescription());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username da cui risalire all'id
     * @return id dell'utente con il nome passato a parametro. -1 in caso l'utente non esista.
     */
    public Optional<UserEntity> getByUsername(Username username) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("username", username.value());

        return queryUser("username = :username", arguments);
    }

    /**
     * Metodo che ritorna un utente dal database, ricavandolo dall'id
     * @param id da cui risalire all'utente
     * @return oggetto User con il nome preso dal db. Ritorna null se l'user non esiste.
     */
    public Optional<UserEntity> getById(long id) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("userId", id);

        return queryUser("id = :userId", arguments);
    }

    private Optional<UserEntity> queryUser(String where, Map<String, ?> queryParams) {
        try {
            return Optional.ofNullable(
                    getUserOrUsers()
                            .where(where)
                            .executeForObject(RowMappers::mapToUserEntity, queryParams)
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }


    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username da cui risalire agli users
     * @return una lista di users.
     */
    public List<UserEntity> getByUsernameWithLike(Username username) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("similarUsername", username.value());
        return queryUsers("username ILIKE :similarUsername || '%%'", "ORDER BY username ASC", arguments);
    }

    private List<UserEntity> queryUsers(String where, String other, Map<String, ?> queryParams) {
        try {
            return getUserOrUsers()
                    .where(where)
                    .other(other)
                    .executeForList(RowMappers::mapToUserEntity, queryParams);

        } catch (EmptyResultDataAccessException e) {
            return new ArrayList<>();
        }
    }

    private QueryResult getUserOrUsers() {
        return queryHelper
                .query("SELECT *")
                .from("infolab.users");
    }
}
