package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;

import java.util.Objects;

public class UserEntity {
    private long id;
    private Username name;
    private String description;
    private UserStatusEnum status;

//    public UserEntity() {
//    }

    private UserEntity(long id, Username name, String description, UserStatusEnum status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
    }

    public static UserEntity of(Username name) {
        return new UserEntity(ID.None, name, "", UserStatusEnum.OFFLINE);
    }

    public static UserEntity of(Username name, String description) {
        return new UserEntity(ID.None, name, description, UserStatusEnum.OFFLINE);
    }

    public static UserEntity of(Username name, String description, UserStatusEnum status) {
        return new UserEntity(ID.None, name, description, status);
    }

    public static UserEntity of(long id, Username name, String description) {
        return new UserEntity(id, name, description, UserStatusEnum.OFFLINE);
    }

    public static UserEntity of(long id, Username name, String description, UserStatusEnum status) {
        return new UserEntity(id, name, description, status);
    }

    public static UserEntity empty() {
        return new UserEntity(ID.None, Username.empty(), "", UserStatusEnum.OFFLINE);
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserStatusEnum getStatus() {
        return status;
    }

    public void setStatus(UserStatusEnum status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserEntity user = (UserEntity) o;
        return id == user.id && Objects.equals(name, user.name) && Objects.equals(description, user.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description);
    }
}
