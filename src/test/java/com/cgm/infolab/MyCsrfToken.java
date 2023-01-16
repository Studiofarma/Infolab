package com.cgm.infolab;

public record MyCsrfToken(String headerName, String parameterName, String token) {
}
