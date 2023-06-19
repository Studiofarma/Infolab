package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

public class UserEntity {
    private long id;
    private Username name;

    private String description;

//    public UserEntity() {
//    }

    private UserEntity(long id, Username name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public static UserEntity of(Username name) {
        return new UserEntity(ID.None, name, "");
    }

    public static UserEntity of(Username name, String description) {
        return new UserEntity(ID.None, name, description);
    }

    public static UserEntity of(long id, Username name) {
        return new UserEntity(id, name, "");
    }

    public static UserEntity of(long id, Username name, String description) {
        return new UserEntity(id, name, description);
    }

    public static UserEntity empty() {
        return new UserEntity(ID.None, Username.empty(), "");
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

    public String getDescription() {return description;}

    public void setDescription(String description) {this.description = description;}
}
