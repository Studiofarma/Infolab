package com.cgm.infolab.model;

import com.cgm.infolab.db.ID;

import java.net.URI;
import java.util.Objects;

public class UserDto {
    private String name;
    private long id;
    private String description;
    private String status;
    private String theme;
    private URI avatarLink;

    private UserDto() {
    }
    public UserDto(String username, long id, String description, String status, String theme, URI avatarLink) {
        this.name = username;
        this.id = id;
        this.description = description;
        this.status = status;
        this.theme = theme;
        this.avatarLink = avatarLink;
    }

    public static UserDto of(String name, long id, String description, String status, URI avatarLink) {
        return new UserDto(name, id, description, status, null, avatarLink);
    }

    public static UserDto of(String name, long id, String description, String status, String theme, URI avatarLink) {
        return new UserDto(name, id, description, status, theme, avatarLink);
    }

    public static UserDto empty() {
        return new UserDto("", ID.None, "", "", "", null);
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

    public URI getAvatarLink() {
        return avatarLink;
    }

    public void setAvatarLink(URI avatarLink) {
        this.avatarLink = avatarLink;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDto userDto = (UserDto) o;
        return id == userDto.id && Objects.equals(name, userDto.name) && Objects.equals(description, userDto.description) && Objects.equals(status, userDto.status) && Objects.equals(theme, userDto.theme) && Objects.equals(avatarLink, userDto.avatarLink);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, id, description, status, theme, avatarLink);
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "name='" + name + '\'' +
                ", id=" + id +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", theme='" + theme + '\'' +
                ", avatarLink=" + avatarLink +
                '}';
    }
}
