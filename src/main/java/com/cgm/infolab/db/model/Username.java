package com.cgm.infolab.db.model;

import java.util.Objects;

public record Username(String value) {
    public Username(String value) {
        this.value = value.toLowerCase();
    }
    public static Username of(String value) {
        return new Username(value);
    }

    public static Username empty() {
        return new Username("");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Username username = (Username) o;
        return Objects.equals(value, username.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
