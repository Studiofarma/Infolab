package com.cgm.infolab.model;

import java.util.Objects;

public class PaginationLinksDto {
    String prev;
    String next;

    public PaginationLinksDto() {
    }

    public PaginationLinksDto(String prev, String next) {
        this.prev = prev;
        this.next = next;
    }

    public String getPrev() {
        return prev;
    }

    public void setPrev(String prev) {
        this.prev = prev;
    }

    public String getNext() {
        return next;
    }

    public void setNext(String next) {
        this.next = next;
    }

    @Override
    public String toString() {
        return "PaginationLinksDto{" +
                "prev='" + prev + '\'' +
                ", next='" + next + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaginationLinksDto that = (PaginationLinksDto) o;
        return Objects.equals(prev, that.prev) && Objects.equals(next, that.next);
    }

    @Override
    public int hashCode() {
        return Objects.hash(prev, next);
    }
}
