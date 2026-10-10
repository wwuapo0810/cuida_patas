package com.cuidapatas.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Lee el token del header 'Authorization: Bearer <token>' en cada petición y, si es
 * válido, deja al usuario autenticado en el contexto de seguridad.
 *
 * Si no hay token o es inválido, el filtro NO rechaza la petición: simplemente la
 * deja pasar sin autenticación. Quién puede entrar a qué ruta lo decide
 * SecurityConfig, y así los endpoints públicos (registro y login) siguen abiertos.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioDetailsService usuarioDetailsService) {
        this.jwtService = jwtService;
        this.usuarioDetailsService = usuarioDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = extraerToken(request);

        // Si ya hay autenticación en el contexto no se vuelve a resolver.
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String correo = jwtService.extraerCorreo(token);
            if (correo != null) {
                autenticar(request, correo);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void autenticar(HttpServletRequest request, String correo) {
        try {
            UserDetails usuario = usuarioDetailsService.loadUserByUsername(correo);

            // Token firmado por nosotros, pero el usuario fue desactivado después.
            if (!usuario.isEnabled()) {
                return;
            }

            var autenticacion = new UsernamePasswordAuthenticationToken(
                    usuario, null, usuario.getAuthorities());
            autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(autenticacion);

        } catch (UsernameNotFoundException usuarioBorrado) {
            // El token es válido pero el usuario ya no existe: se sigue sin sesión.
        }
    }

    private String extraerToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header == null || !header.startsWith(PREFIJO)) {
            return null;
        }
        String token = header.substring(PREFIJO.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
