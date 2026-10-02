package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Desparasitacion;
import com.cuidapatas.backend.entity.enums.EstadoSalud;
import com.cuidapatas.backend.entity.enums.TipoDesparasitacion;

import java.time.LocalDate;

public record DesparasitacionResponse(
        Long id,
        Long mascotaId,
        TipoDesparasitacion tipo,
        String producto,
        LocalDate fecha,
        LocalDate proximaFecha,
        String observaciones,
        EstadoSalud estado
) {
    public static DesparasitacionResponse from(Desparasitacion item, EstadoSalud estado) {
        return new DesparasitacionResponse(
                item.getId(),
                item.getMascota().getId(),
                item.getTipo(),
                item.getProducto(),
                item.getFecha(),
                item.getProximaFecha(),
                item.getObservaciones(),
                estado
        );
    }
}
