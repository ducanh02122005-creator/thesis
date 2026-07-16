package com.example.frauddetection.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TransactionBlockedException extends RuntimeException {
    public TransactionBlockedException(String message) {
        super(message);
    }
}
