package com.cuidapatas.backend.service;

import com.cuidapatas.backend.dto.DesparasitacionRequest;
import com.cuidapatas.backend.dto.DesparasitacionResponse;
import com.cuidapatas.backend.dto.MedicamentoRequest;
import com.cuidapatas.backend.dto.MedicamentoResponse;
import com.cuidapatas.backend.dto.VacunaRequest;
import com.cuidapatas.backend.dto.VacunaResponse;
import com.cuidapatas.backend.entity.Desparasitacion;
import com.cuidapatas.backend.entity.Mascota;
import com.cuidapatas.backend.entity.Medicamento;
import com.cuidapatas.backend.entity.Vacuna;
import com.cuidapatas.backend.exception.RecursoNoEncontradoException;
import com.cuidapatas.backend.repository.DesparasitacionRepository;
import com.cuidapatas.backend.repository.MedicamentoRepository;
import com.cuidapatas.backend.repository.VacunaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class SaludService {

    private final MascotaService mascotaService;
    private final VacunaRepository vacunaRepository;
    private final DesparasitacionRepository desparasitacionRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final EstadoSaludService estadoSaludService;

    public SaludService(
            MascotaService mascotaService,
            VacunaRepository vacunaRepository,
            DesparasitacionRepository desparasitacionRepository,
            MedicamentoRepository medicamentoRepository,
            EstadoSaludService estadoSaludService) {
        this.mascotaService = mascotaService;
        this.vacunaRepository = vacunaRepository;
        this.desparasitacionRepository = desparasitacionRepository;
        this.medicamentoRepository = medicamentoRepository;
        this.estadoSaludService = estadoSaludService;
    }

    @Transactional(readOnly = true)
    public List<VacunaResponse> listarVacunas(Long mascotaId) {
        mascotaService.obtenerActiva(mascotaId);
        return vacunaRepository.findByMascotaIdOrderByProximaFechaAsc(mascotaId).stream()
                .map(vacuna -> VacunaResponse.from(vacuna, estadoSaludService.calcular(vacuna.getProximaFecha())))
                .toList();
    }

    @Transactional
    public VacunaResponse crearVacuna(Long mascotaId, VacunaRequest request) {
        Mascota mascota = mascotaService.obtenerActiva(mascotaId);
        validarFechaPosterior(request.proximaFecha(), request.fechaAplicacion(), "proximaFecha debe ser posterior a fechaAplicacion");
        Vacuna vacuna = new Vacuna();
        vacuna.setMascota(mascota);
        vacuna.setNombre(request.nombre());
        vacuna.setFechaAplicacion(request.fechaAplicacion());
        vacuna.setProximaFecha(request.proximaFecha());
        vacuna.setVeterinario(request.veterinario());
        vacuna.setObservaciones(request.observaciones());
        Vacuna guardada = vacunaRepository.save(vacuna);
        return VacunaResponse.from(guardada, estadoSaludService.calcular(guardada.getProximaFecha()));
    }

    @Transactional(readOnly = true)
    public List<DesparasitacionResponse> listarDesparasitaciones(Long mascotaId) {
        mascotaService.obtenerActiva(mascotaId);
        return desparasitacionRepository.findByMascotaId(mascotaId).stream()
                .sorted(Comparator.comparing(Desparasitacion::getProximaFecha,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(item -> DesparasitacionResponse.from(item, estadoSaludService.calcular(item.getProximaFecha())))
                .toList();
    }

    @Transactional
    public DesparasitacionResponse crearDesparasitacion(Long mascotaId, DesparasitacionRequest request) {
        Mascota mascota = mascotaService.obtenerActiva(mascotaId);
        validarFechaPosterior(request.proximaFecha(), request.fecha(), "proximaFecha debe ser posterior a fecha");
        Desparasitacion item = new Desparasitacion();
        item.setMascota(mascota);
        item.setTipo(request.tipo());
        item.setProducto(request.producto());
        item.setFecha(request.fecha());
        item.setProximaFecha(request.proximaFecha());
        item.setObservaciones(request.observaciones());
        Desparasitacion guardada = desparasitacionRepository.save(item);
        return DesparasitacionResponse.from(guardada, estadoSaludService.calcular(guardada.getProximaFecha()));
    }

    @Transactional(readOnly = true)
    public List<MedicamentoResponse> listarMedicamentos(Long mascotaId) {
        mascotaService.obtenerActiva(mascotaId);
        return medicamentoRepository.findByMascotaId(mascotaId).stream()
                .sorted(Comparator.comparing(Medicamento::getFechaFin,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(medicamento -> MedicamentoResponse.from(medicamento,
                        estadoSaludService.calcular(medicamento.getFechaFin())))
                .toList();
    }

    @Transactional
    public MedicamentoResponse crearMedicamento(Long mascotaId, MedicamentoRequest request) {
        Mascota mascota = mascotaService.obtenerActiva(mascotaId);
        if (request.fechaFin() != null && !request.fechaFin().isAfter(request.fechaInicio())) {
            throw new IllegalArgumentException("fechaFin debe ser posterior a fechaInicio");
        }
        Medicamento medicamento = new Medicamento();
        medicamento.setMascota(mascota);
        medicamento.setNombre(request.nombre());
        medicamento.setDosis(request.dosis());
        medicamento.setFrecuenciaHoras(request.frecuenciaHoras());
        medicamento.setFechaInicio(request.fechaInicio());
        medicamento.setFechaFin(request.fechaFin());
        medicamento.setObservaciones(request.observaciones());
        Medicamento guardado = medicamentoRepository.save(medicamento);
        return MedicamentoResponse.from(guardado, estadoSaludService.calcular(guardado.getFechaFin()));
    }

    private void validarFechaPosterior(java.time.LocalDate posterior, java.time.LocalDate anterior, String mensaje) {
        if (posterior != null && !posterior.isAfter(anterior)) {
            throw new IllegalArgumentException(mensaje);
        }
    }
}
