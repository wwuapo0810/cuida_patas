package com.cuidapatas.backend.security;

import com.cuidapatas.backend.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adaptador entre la entidad Usuario y lo que Spring Security espera (UserDetails).
 *
 * Además de las credenciales expone el id, que es lo que los controladores
 * necesitan para filtrar datos por usuario (por ejemplo GET /api/mascotas?usuarioId=).
 *
 * Nota: este avance no maneja roles. Todos los usuarios autenticados tienen los
 * mismos permisos, por eso la lista de authorities va vacía. Cuando se agregue el
 * campo 'rol' a la entidad (requiere una migración V2), se devuelve aquí como
 * SimpleGrantedAuthority("ROLE_" + rol) y las reglas se declaran en SecurityConfig.
 */
public class UsuarioAutenticado implements UserDetails {

    private final Long id;
    private final String correo;
    private final String hashContrasena;
    private final boolean activo;

    public UsuarioAutenticado(Usuario usuario) {
        this.id = usuario.getId();
        this.correo = usuario.getCorreo();
        this.hashContrasena = usuario.getContrasena();
        this.activo = Boolean.TRUE.equals(usuario.getActivo());
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return hashContrasena;
    }

    @Override
    public String getUsername() {
        return correo;
    }

    /**
     * El borrado lógico de la entidad se traduce en cuenta deshabilitada: un usuario
     * con activo=false no puede iniciar sesión ni usar un token emitido antes.
     */
    @Override
    public boolean isEnabled() {
        return activo;
    }
}
