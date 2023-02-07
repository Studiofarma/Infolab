package com.cgm.infolab.db;

public class UserEntity {
    private long id;
    private String name;

    // TODO: implementare nel codice il factory method e rimuovere questo
    public UserEntity(String name) {
        this(ID.None, name);
    }

    // TODO: rendere private
    public UserEntity(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public static UserEntity of(String name) {
        return new UserEntity(ID.None, name);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
