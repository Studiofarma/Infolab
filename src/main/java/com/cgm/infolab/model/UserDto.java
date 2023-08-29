package com.cgm.infolab.model;

public class UserDto {
    private String name;
    private long id;
    private String description;
    private String status;

    private UserDto() {
    }
    public UserDto(String username, long id, String description, String status) {
        this.name = username;
        this.id = id;
        this.description = description;
        this.status = status;
    }

    public static UserDto of(String name, long id, String description, String status) {
        return new UserDto(name, id, description, status);
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
}
