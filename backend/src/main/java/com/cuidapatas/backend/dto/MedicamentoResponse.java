package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Medicamento;
import com.cuidapatas.backend.entity.enums.EstadoSalud;

import java.time.LocalDate;

public record MedicamentoResponse(
        Long id,
        Long mascotaId,
        String nombre,
        String dosis,
        Integer frecuenciaHoras,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String observaciones,
        EstadoSalud estado
) {
    public static MedicamentoResponse from(Medicamento medicamento, EstadoSalud estado) {
        return new MedicamentoResponse(
                medicamento.getId(),
                medicamento.getMascota().getId(),
                medicamento.getNombre(),
                medicamento.getDosis(),
                medicamento.getFrecuenciaHoras(),
                medicamento.getFechaInicio(),
                medicamento.getFechaFin(),
                medicamento.getObservaciones(),
                estado
        );
    }
}
