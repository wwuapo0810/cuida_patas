package com.cuidapatas.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record VacunaRequest(
        @NotBlank String nombre,
        @NotNull @PastOrPresent LocalDate fechaAplicacion,
        LocalDate proximaFecha,
        String veterinario,
        String observaciones
) {
}
