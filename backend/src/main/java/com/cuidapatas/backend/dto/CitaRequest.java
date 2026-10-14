package com.cuidapatas.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Datos para agendar una cita. El servicio es opcional: si la cita es en un lugar
 * que no está en el directorio, se describe con 'lugar'.
 */
public record CitaRequest(
        @NotNull(message = "Elegí una mascota")
        Long mascotaId,

        Long servicioId,

        @NotNull(message = "La fecha y la hora son obligatorias")
        LocalDateTime fechaHora,

        @Size(max = 120, message = "El veterinario no puede pasar de 120 caracteres")
        String veterinario,

        @Size(max = 160, message = "El lugar no puede pasar de 160 caracteres")
        String lugar,

        @Size(max = 500, message = "El motivo no puede pasar de 500 caracteres")
        String motivo
) {
}
