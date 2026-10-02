package com.cuidapatas.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record MedicamentoRequest(
        @NotBlank String nombre,
        String dosis,
        @Positive Integer frecuenciaHoras,
        @NotNull @PastOrPresent LocalDate fechaInicio,
        LocalDate fechaFin,
        String observaciones
) {
}
