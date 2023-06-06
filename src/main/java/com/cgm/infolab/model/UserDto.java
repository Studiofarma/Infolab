package com.cgm.infolab.model;

public class UserDto {
    private String name;

    private long id;

    private UserDto() {
    }
    public UserDto(String username, long id) {
        this.name = username;
        this.id = id;
    }

    public static UserDto of(String name, long id) {
        return new UserDto(name, id);
    }

//  ID
    public long getId() {return this.id;}
    public void setId(long id) {this.id = id;}

//  Name
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}
}
