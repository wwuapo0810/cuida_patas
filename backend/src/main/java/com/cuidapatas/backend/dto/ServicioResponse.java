package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Servicio;
import com.cuidapatas.backend.entity.enums.TipoServicio;

public record ServicioResponse(
        Long id,
        String nombre,
        TipoServicio tipo,
        String direccion,
        String telefono,
        String horario,
        Boolean destacado
) {
    public static ServicioResponse from(Servicio servicio) {
        return new ServicioResponse(
                servicio.getId(),
                servicio.getNombre(),
                servicio.getTipo(),
                servicio.getDireccion(),
                servicio.getTelefono(),
                servicio.getHorario(),
                servicio.getDestacado()
        );
    }
}
