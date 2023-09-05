package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

import java.sql.Blob;
import java.util.Objects;

public class AvatarEntity {
    private long id;
    private Blob image;

    private AvatarEntity(long id, Blob image) {
        this.id = id;
        this.image = image;
    }

    public static AvatarEntity of(Blob image) {
        return new AvatarEntity(ID.None, image);
    }

    public static AvatarEntity of(long id, Blob image) {
        return new AvatarEntity(id, image);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Blob getImage() {
        return image;
    }

    public void setImage(Blob image) {
        this.image = image;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AvatarEntity that = (AvatarEntity) o;
        return id == that.id && Objects.equals(image, that.image);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, image);
    }

    @Override
    public String toString() {
        return "AvatarEntity{" +
                "id=" + id +
                ", image=" + image +
                '}';
    }
}
