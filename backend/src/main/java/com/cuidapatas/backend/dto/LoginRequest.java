package com.cuidapatas.backend.dto;

import jakarta.validation.constraints.NotBlank;

/** Credenciales del login. El correo es el identificador del usuario. */
public record LoginRequest(
        @NotBlank(message = "El correo es obligatorio")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena
) {
}
