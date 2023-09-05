package com.cgm.infolab.model;

import com.cgm.infolab.db.ID;

public class UserDto {
    private String name;
    private long id;
    private String description;
    private String status;
    private String theme;

    private UserDto() {
    }
    public UserDto(String username, long id, String description, String status, String theme) {
        this.name = username;
        this.id = id;
        this.description = description;
        this.status = status;
        this.theme = theme;
    }

    public static UserDto of(String name, long id, String description, String status) {
        return new UserDto(name, id, description, status, null);
    }

    public static UserDto of(String name, long id, String description, String status, String theme) {
        return new UserDto(name, id, description, status, theme);
    }

    public static UserDto empty() {
        return new UserDto("", ID.None, "", "", "");
    }

    public long getId() {
        return this.id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }
}
