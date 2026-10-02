package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Desparasitacion;
import com.cuidapatas.backend.entity.enums.TipoDesparasitacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesparasitacionRepository extends JpaRepository<Desparasitacion, Long> {

    List<Desparasitacion> findByMascotaId(Long mascotaId);

    List<Desparasitacion> findByMascotaIdAndTipo(Long mascotaId, TipoDesparasitacion tipo);
}
