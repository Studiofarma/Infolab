package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

public class UserEntity {
    private long id;
    private String name;

    public UserEntity() {
    }

    private UserEntity(long id, String name) {
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
