package ru.zan.Pulsometer.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) 
public class KeyPointNotFoundException extends RuntimeException {
    public KeyPointNotFoundException(String message) {
        super(message);
    }
}