package com.cuidapatas.backend.service;

import com.cuidapatas.backend.entity.enums.EstadoSalud;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class EstadoSaludService {

    private static final long DIAS_POR_VENCER = 15;
    private final Clock clock;

    public EstadoSaludService() {
        this(Clock.systemDefaultZone());
    }

    EstadoSaludService(Clock clock) {
        this.clock = clock;
    }

    public EstadoSalud calcular(LocalDate fecha) {
        if (fecha == null) {
            return EstadoSalud.SIN_FECHA;
        }

        LocalDate hoy = LocalDate.now(clock);
        if (fecha.isBefore(hoy)) {
            return EstadoSalud.VENCIDO;
        }

        long dias = ChronoUnit.DAYS.between(hoy, fecha);
        return dias <= DIAS_POR_VENCER ? EstadoSalud.POR_VENCER : EstadoSalud.AL_DIA;
    }
}
