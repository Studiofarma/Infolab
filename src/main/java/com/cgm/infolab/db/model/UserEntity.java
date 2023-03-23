package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

public class UserEntity {
    private long id;
    private Username name;

//    public UserEntity() {
//    }

    private UserEntity(long id, Username name) {
        this.id = id;
        this.name = name;
    }

    public static UserEntity of(Username name) {
        return new UserEntity(ID.None, name);
    }

    public static UserEntity of(long id, Username name) {
        return new UserEntity(id, name);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Username getName() {
        return name;
    }

    public void setName(Username name) {
        this.name = name;
    }
}
