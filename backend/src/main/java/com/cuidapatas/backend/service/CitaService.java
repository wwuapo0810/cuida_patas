package com.cuidapatas.backend.service;

import com.cuidapatas.backend.dto.CitaRequest;
import com.cuidapatas.backend.dto.CitaResponse;
import com.cuidapatas.backend.entity.Cita;
import com.cuidapatas.backend.entity.Mascota;
import com.cuidapatas.backend.entity.Servicio;
import com.cuidapatas.backend.entity.enums.EstadoCita;
import com.cuidapatas.backend.exception.RecursoNoEncontradoException;
import com.cuidapatas.backend.repository.CitaRepository;
import com.cuidapatas.backend.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final ServicioRepository servicioRepository;
    private final MascotaService mascotaService;

    public CitaService(
            CitaRepository citaRepository,
            ServicioRepository servicioRepository,
            MascotaService mascotaService) {
        this.citaRepository = citaRepository;
        this.servicioRepository = servicioRepository;
        this.mascotaService = mascotaService;
    }

    /** Agenda completa del usuario, de la cita más antigua a la más lejana. */
    @Transactional(readOnly = true)
    public List<CitaResponse> listarDeUsuario(Long usuarioId) {
        return citaRepository.findDeUsuario(usuarioId).stream()
                .map(CitaResponse::from)
                .toList();
    }

    /**
     * Agenda una cita para una mascota del usuario. Si la mascota es de otra
     * persona responde "no encontrada", igual que GET /api/mascotas/{id}.
     */
    @Transactional
    public CitaResponse crear(Long usuarioId, CitaRequest request) {
        Mascota mascota = mascotaService.obtenerActiva(request.mascotaId());
        if (!mascota.getUsuario().getId().equals(usuarioId)) {
            throw new RecursoNoEncontradoException(
                    "No existe una mascota activa con id " + request.mascotaId());
        }

        Servicio servicio = null;
        if (request.servicioId() != null) {
            servicio = servicioRepository.findById(request.servicioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No existe un servicio con id " + request.servicioId()));
        }

        Cita cita = new Cita();
        cita.setMascota(mascota);
        cita.setServicio(servicio);
        cita.setFechaHora(request.fechaHora());
        cita.setVeterinario(textoOpcional(request.veterinario()));
        cita.setLugar(textoOpcional(request.lugar()));
        cita.setMotivo(textoOpcional(request.motivo()));
        cita.setEstado(EstadoCita.PROGRAMADA);

        return CitaResponse.from(citaRepository.save(cita));
    }

    /** Los formularios mandan "" en los campos vacíos: se guardan como NULL. */
    private String textoOpcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
