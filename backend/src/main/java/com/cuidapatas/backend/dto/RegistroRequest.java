package com.cuidapatas.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos que envía el formulario de registro.
 *
 * La contraseña llega en texto plano (va sobre HTTPS en producción) y se cifra
 * con BCrypt en AuthService antes de tocar la base de datos.
 */
public record RegistroRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no puede pasar de 120 caracteres")
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 160, message = "El correo no puede pasar de 160 caracteres")
        String correo,

        /*
         * 8 caracteres como mínimo. El máximo de 72 es un límite real de BCrypt:
         * ignora todo lo que pase de 72 bytes, así que es mejor rechazarlo que
         * aceptar una contraseña que se trunca en silencio.
         */
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String contrasena,

        @Size(max = 30, message = "El teléfono no puede pasar de 30 caracteres")
        String telefono
) {
}
