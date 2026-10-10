package com.cuidapatas.backend.security;

import com.cuidapatas.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Le dice a Spring Security cómo buscar un usuario: por correo, con el
 * findByCorreo que ya existía en UsuarioRepository.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        return usuarioRepository.findByCorreo(correo)
                .map(UsuarioAutenticado::new)
                // El mensaje es genérico a propósito: no revela si el correo existe.
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas"));
    }
}
