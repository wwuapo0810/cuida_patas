package com.cuidapatas.backend.security;

import com.cuidapatas.backend.exception.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

/**
 * Qué responder cuando alguien pide un endpoint protegido sin token válido.
 *
 * Por defecto Spring Security devuelve un 403 con cuerpo vacío. Esto devuelve un
 * 401 con el mismo formato JSON (ApiError) que usa el resto de la API, para que el
 * frontend pueda distinguir "no tengo sesión" de un error cualquiera y redirigir
 * a /login.
 */
@Component
public class ManejadorNoAutenticado implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public ManejadorNoAutenticado(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiError error = new ApiError(
                Instant.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Se requiere iniciar sesión para acceder a este recurso",
                Map.of());

        objectMapper.writeValue(response.getOutputStream(), error);
    }
}
