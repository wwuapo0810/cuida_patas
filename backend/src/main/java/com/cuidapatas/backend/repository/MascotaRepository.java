package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    List<Mascota> findByUsuarioIdAndActivoTrue(Long usuarioId);

    /** Cuenta las mascotas vigentes de un usuario: sostiene el límite del plan gratuito. */
    long countByUsuarioIdAndActivoTrue(Long usuarioId);
}
