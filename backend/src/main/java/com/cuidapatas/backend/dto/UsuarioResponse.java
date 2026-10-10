package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Usuario;
import com.cuidapatas.backend.entity.enums.Plan;

/**
 * Vista pública de un usuario: lo que el frontend puede conocer de la sesión.
 * Deja fuera a propósito el campo 'contrasena'.
 */
public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        String telefono,
        Plan plan
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getPlan()
        );
    }
}
