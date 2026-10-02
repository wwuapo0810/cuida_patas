package com.cuidapatas.backend.dto;

import com.cuidapatas.backend.entity.Mascota;
import com.cuidapatas.backend.entity.enums.Especie;
import com.cuidapatas.backend.entity.enums.Sexo;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MascotaResponse(
        Long id,
        Long usuarioId,
        String nombre,
        Especie especie,
        String raza,
        Sexo sexo,
        LocalDate fechaNacimiento,
        BigDecimal peso,
        String foto,
        Boolean activo
) {
    public static MascotaResponse from(Mascota mascota) {
        return new MascotaResponse(
                mascota.getId(),
                mascota.getUsuario().getId(),
                mascota.getNombre(),
                mascota.getEspecie(),
                mascota.getRaza(),
                mascota.getSexo(),
                mascota.getFechaNacimiento(),
                mascota.getPeso(),
                mascota.getFoto(),
                mascota.getActivo()
        );
    }
}
