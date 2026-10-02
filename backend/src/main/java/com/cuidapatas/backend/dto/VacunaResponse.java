package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Vacuna;
import com.cuidapatas.backend.entity.enums.EstadoSalud;

import java.time.LocalDate;

public record VacunaResponse(
        Long id,
        Long mascotaId,
        String nombre,
        LocalDate fechaAplicacion,
        LocalDate proximaFecha,
        String veterinario,
        String observaciones,
        EstadoSalud estado
) {
    public static VacunaResponse from(Vacuna vacuna, EstadoSalud estado) {
        return new VacunaResponse(
                vacuna.getId(),
                vacuna.getMascota().getId(),
                vacuna.getNombre(),
                vacuna.getFechaAplicacion(),
                vacuna.getProximaFecha(),
                vacuna.getVeterinario(),
                vacuna.getObservaciones(),
                estado
        );
    }
}
