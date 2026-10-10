package com.cuidapatas.backend.dto;

/**
 * Respuesta de /api/auth/registro y /api/auth/login.
 *
 * Incluye los datos del usuario además del token para que el frontend no tenga
 * que decodificar el JWT ni hacer una segunda llamada. El usuarioId es
 * imprescindible: es el parámetro de GET /api/mascotas?usuarioId=...
 *
 * Nunca incluye el hash de la contraseña.
 */
public record AuthResponse(
        String token,
        /** Segundos de vida del token, para que el frontend sepa cuándo expira. */
        long expiraEnSegundos,
        UsuarioResponse usuario
) {
}
