package ru.zan.Pulsometer.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class TimeUtils {

    public static LocalDateTime convertEpochMillisToUTC(long epochMillis) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), ZoneOffset.UTC);
    }
}
