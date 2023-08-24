package com.cgm.infolab.model;

import java.util.Objects;

public class IdDto {

    private long id;

    public IdDto() {}

    public IdDto(int id) {
        this.id = id;
    }

    public IdDto(long id) {
        this.id = id;
    }

    public static IdDto of(long id) {
        return new IdDto(id);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "IdDto{" +
                "id=" + id +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IdDto idDto = (IdDto) o;
        return id == idDto.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
