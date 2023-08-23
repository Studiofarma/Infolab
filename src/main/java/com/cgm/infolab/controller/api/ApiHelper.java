package com.cgm.infolab.controller.api;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ApiHelper {
    public void throwOnRangePagination() {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Range Pagination Not Supported. Query parameters page[before] and page[after] can't be used together");
    }

    public void throwForbiddenStatus() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
}
