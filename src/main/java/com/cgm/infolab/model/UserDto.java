package com.cgm.infolab.model;

public class UserDto {
    private String name;

    private long id;

    private String description;

    private UserDto() {
    }
    public UserDto(String username, long id, String description) {
        this.name = username;
        this.id = id;
        this.description = description;
    }

    public static UserDto of(String name, long id, String description) {
        return new UserDto(name, id, description);
    }

//  ID
    public long getId() {return this.id;}
    public void setId(long id) {this.id = id;}

//  Name
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}
}
