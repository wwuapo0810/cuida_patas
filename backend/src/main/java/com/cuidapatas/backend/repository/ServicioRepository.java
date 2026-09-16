package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Servicio;
import com.cuidapatas.backend.entity.enums.TipoServicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    List<Servicio> findByTipo(TipoServicio tipo);

    /** Los destacados van primero en el directorio. */
    List<Servicio> findAllByOrderByDestacadoDescNombreAsc();

    List<Servicio> findByNombreContainingIgnoreCase(String texto);
}
