package com.cgm.infolab.db.model;

import org.springframework.lang.NonNull;

import java.util.Objects;

public final class Username {
    @NonNull
    private final String value;

    private Username() {
        this("");
    }

    public Username(String value) {
        this.value = value.toLowerCase();
    }

    public static Username of(String value) {
        return new Username(value);
    }

    @NonNull
    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this) return true;
        if (obj == null || obj.getClass() != this.getClass()) return false;
        var that = (Username) obj;
        return Objects.equals(this.value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "Username[" +
                "value=" + value + ']';
    }

}
