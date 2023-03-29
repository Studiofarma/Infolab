package com.cgm.infolab.db.model;

public record Username(String value) {
    public Username(String value) {
        this.value = value.toLowerCase();
    }
    public static Username of(String value) {
        return new Username(value);
    }
}
