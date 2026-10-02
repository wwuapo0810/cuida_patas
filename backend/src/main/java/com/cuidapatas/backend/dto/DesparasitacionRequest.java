package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.enums.TipoDesparasitacion;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record DesparasitacionRequest(
        @NotNull TipoDesparasitacion tipo,
        String producto,
        @NotNull @PastOrPresent LocalDate fecha,
        LocalDate proximaFecha,
        String observaciones
) {
}
