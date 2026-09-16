package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Recordatorio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecordatorioRepository extends JpaRepository<Recordatorio, Long> {

    List<Recordatorio> findByMascotaId(Long mascotaId);

    /** Pendientes de envío hasta una fecha: base del proceso de notificaciones. */
    List<Recordatorio> findByEnviadoFalseAndFechaEventoLessThanEqual(LocalDate hasta);
}
