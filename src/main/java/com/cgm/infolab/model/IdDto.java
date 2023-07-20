package com.cgm.infolab.model;

public record IdDto(long id) {

    public static IdDto of(long id) {
        return new IdDto(id);
    }
}
