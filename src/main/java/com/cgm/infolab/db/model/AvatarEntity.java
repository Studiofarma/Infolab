package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

import java.sql.Blob;
import java.util.Arrays;
import java.util.Objects;

public class AvatarEntity {
    private long id;
    private byte[] image;

    private AvatarEntity(long id, byte[] image) {
        this.id = id;
        this.image = image;
    }

    public static AvatarEntity of(byte[] image) {
        return new AvatarEntity(ID.None, image);
    }

    public static AvatarEntity of(long id, byte[] image) {
        return new AvatarEntity(id, image);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AvatarEntity avatar = (AvatarEntity) o;
        return id == avatar.id && Arrays.equals(image, avatar.image);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(id);
        result = 31 * result + Arrays.hashCode(image);
        return result;
    }

    @Override
    public String toString() {
        return "AvatarEntity{" +
                "id=" + id +
                ", image=" + Arrays.toString(image) +
                '}';
    }
}
