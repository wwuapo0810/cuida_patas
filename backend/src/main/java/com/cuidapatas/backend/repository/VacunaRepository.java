package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VacunaRepository extends JpaRepository<Vacuna, Long> {

    List<Vacuna> findByMascotaId(Long mascotaId);

    List<Vacuna> findByMascotaIdOrderByProximaFechaAsc(Long mascotaId);
}
