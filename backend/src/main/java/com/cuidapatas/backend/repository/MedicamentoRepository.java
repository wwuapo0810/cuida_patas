package com.cuidapatas.backend.repository;

import com.cuidapatas.backend.entity.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    List<Medicamento> findByMascotaId(Long mascotaId);

    /** Tratamientos sin fecha de término: los continuos. */
    List<Medicamento> findByMascotaIdAndFechaFinIsNull(Long mascotaId);
}
