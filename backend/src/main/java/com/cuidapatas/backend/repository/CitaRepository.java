package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Cita;
import com.cuidapatas.backend.entity.enums.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByMascotaIdOrderByFechaHoraAsc(Long mascotaId);

    List<Cita> findByMascotaIdAndEstado(Long mascotaId, EstadoCita estado);

    /** Agenda de un rango: alimenta la vista de calendario mensual. */
    List<Cita> findByMascotaIdAndFechaHoraBetween(Long mascotaId, LocalDateTime desde, LocalDateTime hasta);
}
