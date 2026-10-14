package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Cita;
import com.cuidapatas.backend.entity.Servicio;
import com.cuidapatas.backend.entity.enums.EstadoCita;

import java.time.LocalDateTime;

/**
 * Una cita lista para la agenda. Incluye el nombre de la mascota y del servicio
 * para que el frontend no tenga que cruzar listados para mostrarlos.
 */
public record CitaResponse(
        Long id,
        Long mascotaId,
        String mascotaNombre,
        Long servicioId,
        String servicioNombre,
        LocalDateTime fechaHora,
        String veterinario,
        String lugar,
        String motivo,
        EstadoCita estado
) {
    public static CitaResponse from(Cita cita) {
        Servicio servicio = cita.getServicio();
        return new CitaResponse(
                cita.getId(),
                cita.getMascota().getId(),
                cita.getMascota().getNombre(),
                servicio == null ? null : servicio.getId(),
                servicio == null ? null : servicio.getNombre(),
                cita.getFechaHora(),
                cita.getVeterinario(),
                cita.getLugar(),
                cita.getMotivo(),
                cita.getEstado()
        );
    }
}
