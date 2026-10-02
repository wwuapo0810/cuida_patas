package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Punto de entrada del login: el correo es el identificador del usuario. */
    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);
}
