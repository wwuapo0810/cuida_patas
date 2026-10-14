package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Cita;
import com.cuidapatas.backend.entity.enums.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByMascotaIdOrderByFechaHoraAsc(Long mascotaId);

    List<Cita> findByMascotaIdAndEstado(Long mascotaId, EstadoCita estado);

    /** Agenda de un rango: alimenta la vista de calendario mensual. */
    List<Cita> findByMascotaIdAndFechaHoraBetween(Long mascotaId, LocalDateTime desde, LocalDateTime hasta);

    /**
     * Todas las citas de las mascotas activas de un usuario: alimenta la agenda.
     * Trae la mascota y el servicio en la misma consulta para no disparar una
     * consulta extra por cita al armar la respuesta.
     */
    @Query("""
            select c from Cita c
            join fetch c.mascota m
            left join fetch c.servicio
            where m.usuario.id = :usuarioId and m.activo = true
            order by c.fechaHora asc
            """)
    List<Cita> findDeUsuario(@Param("usuarioId") Long usuarioId);
}
