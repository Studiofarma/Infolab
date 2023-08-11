package com.cgm.infolab.helper;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeHelper {
    public static LocalDateTime fromStringToDateTimeWithT(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            return LocalDateTime.parse(date, formatter);
        }
    }

    public static LocalDateTime fromStringToDateTimeWithSpace(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return LocalDateTime.parse(date, formatter);
        }
    }

    public static LocalDate fromStringToDate(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse(date, formatter);
        }
    }

    public static LocalDateTime nowLocalDateTime() {
        return nowTimestamp().toLocalDateTime();
    }

    public static Timestamp nowTimestamp() {
        return new Timestamp(System.currentTimeMillis());
    }
}
