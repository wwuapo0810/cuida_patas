package com.cuidapatas.backend.exception;

/** El correo del registro ya pertenece a otra cuenta (la columna es UNIQUE). */
public class CorreoYaRegistradoException extends RuntimeException {

    public CorreoYaRegistradoException(String message) {
        super(message);
    }
}
