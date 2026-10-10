package com.cuidapatas.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

/**
 * Errores propios de la autenticación, traducidos al mismo formato ApiError que
 * usa el resto de la API.
 *
 * Va en una clase aparte de ApiExceptionHandler para no tocar ese archivo y evitar
 * conflictos cuando el equipo mergee sus ramas. Ninguna de las dos clases maneja
 * las mismas excepciones, así que conviven sin ambigüedad.
 */
@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(CorreoYaRegistradoException.class)
    public ResponseEntity<ApiError> correoDuplicado(CorreoYaRegistradoException exception) {
        return response(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiError> cuentaDesactivada(DisabledException exception) {
        return response(HttpStatus.FORBIDDEN, "La cuenta está desactivada");
    }

    /**
     * Cubre BadCredentialsException y UsernameNotFoundException con un único mensaje
     * genérico: decir "ese correo no existe" le confirmaría a un atacante qué
     * correos están registrados.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> credencialesInvalidas(AuthenticationException exception) {
        return response(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiError(
                Instant.now(), status.value(), status.getReasonPhrase(), message, Map.of()));
    }
}
