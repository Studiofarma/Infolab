package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;

import java.util.Objects;

public class UserEntity {
    private long id;
    private Username name;
    private String description;
    private UserStatusEnum status;
    private ThemeEnum theme;
    private long avatarId;

    private UserEntity(long id, Username name, String description, UserStatusEnum status, ThemeEnum theme, long avatarId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.theme = theme;
        this.avatarId = avatarId;
    }

    public static UserEntity of(Username name) {
        return new UserEntity(ID.None, name, "", UserStatusEnum.OFFLINE, ThemeEnum.LIGHT, ID.None);
    }

    public static UserEntity of(Username name, String description) {
        return new UserEntity(ID.None, name, description, UserStatusEnum.OFFLINE, ThemeEnum.LIGHT, ID.None);
    }

    public static UserEntity of(Username name, String description, UserStatusEnum status) {
        return new UserEntity(ID.None, name, description, status, ThemeEnum.LIGHT, ID.None);
    }

    public static UserEntity of(long id, Username name, String description) {
        return new UserEntity(id, name, description, UserStatusEnum.OFFLINE, ThemeEnum.LIGHT, ID.None);
    }

    public static UserEntity of(long id, Username name, String description, UserStatusEnum status) {
        return new UserEntity(id, name, description, status, ThemeEnum.LIGHT, ID.None);
    }

    public static UserEntity of(long id, Username name, String description, UserStatusEnum status, ThemeEnum theme, long avatarId) {
        return new UserEntity(id, name, description, status, theme, avatarId);
    }

    public static UserEntity empty() {
        return new UserEntity(ID.None, Username.empty(), "", UserStatusEnum.OFFLINE, ThemeEnum.LIGHT, ID.None);
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

    public ThemeEnum getTheme() {
        return theme;
    }

    public void setTheme(ThemeEnum theme) {
        this.theme = theme;
    }

    public long getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(long avatarId) {
        this.avatarId = avatarId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserEntity that = (UserEntity) o;
        return id == that.id && avatarId == that.avatarId && Objects.equals(name, that.name) && Objects.equals(description, that.description) && status == that.status && theme == that.theme;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description, status, theme, avatarId);
    }

    @Override
    public String toString() {
        return "UserEntity{" +
                "id=" + id +
                ", name=" + name +
                ", description='" + description + '\'' +
                ", status=" + status +
                ", theme=" + theme +
                ", avatarId=" + avatarId +
                '}';
    }
}
