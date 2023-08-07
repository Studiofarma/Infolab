package com.cgm.infolab.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class BasicJsonDto<T> {
    PaginationLinksDto links;
    List<T> data;

    private BasicJsonDto() {
    }

    private BasicJsonDto(PaginationLinksDto links, List<T> data) {
        this.links = links;
        this.data = data;
    }

    public static <T> BasicJsonDto<T> of(PaginationLinksDto links, List<T> data) {
        return new BasicJsonDto<>(links, data);
    }

    public static <T> BasicJsonDto<T> empty() {
        return new BasicJsonDto<>(PaginationLinksDto.empty(), new ArrayList<>());
    }

    public PaginationLinksDto getLinks() {
        return links;
    }

    public void setLinks(PaginationLinksDto links) {
        this.links = links;
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "BasicJsonDto{" +
                "links=" + links +
                ", data=" + data +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BasicJsonDto<?> that = (BasicJsonDto<?>) o;
        return Objects.equals(links, that.links) && Objects.equals(data, that.data);
    }

    @Override
    public int hashCode() {
        return Objects.hash(links, data);
    }
}
