package com.cuidapatas.backend.service;

import com.cuidapatas.backend.dto.MascotaResponse;
import com.cuidapatas.backend.entity.Mascota;
import com.cuidapatas.backend.exception.RecursoNoEncontradoException;
import com.cuidapatas.backend.repository.MascotaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MascotaService {

    private final MascotaRepository mascotaRepository;

    public MascotaService(MascotaRepository mascotaRepository) {
        this.mascotaRepository = mascotaRepository;
    }

    @Transactional(readOnly = true)
    public List<MascotaResponse> listar(Long usuarioId) {
        List<Mascota> mascotas = usuarioId == null
                ? mascotaRepository.findByActivoTrue()
                : mascotaRepository.findByUsuarioIdAndActivoTrue(usuarioId);
        return mascotas.stream().map(MascotaResponse::from).toList();
    }

    /**
     * Una mascota activa de un usuario concreto, lista para serializar.
     *
     * Agregado para la pantalla de perfil de mascota del frontend. Si la mascota
     * existe pero es de otro usuario devuelve el mismo "no encontrado" que si no
     * existiera, para no filtrar qué ids están ocupados.
     *
     * El mapeo a DTO se hace acá adentro a propósito: 'usuario' es LAZY y, con
     * open-in-view en false, leerlo desde el controlador quedaría fuera de la
     * transacción.
     */
    @Transactional(readOnly = true)
    public MascotaResponse obtenerDeUsuario(Long mascotaId, Long usuarioId) {
        Mascota mascota = obtenerActiva(mascotaId);

        if (!mascota.getUsuario().getId().equals(usuarioId)) {
            throw new RecursoNoEncontradoException(
                    "No existe una mascota activa con id " + mascotaId);
        }

        return MascotaResponse.from(mascota);
    }

    @Transactional(readOnly = true)
    public Mascota obtenerActiva(Long mascotaId) {
        return mascotaRepository.findById(mascotaId)
                .filter(mascota -> Boolean.TRUE.equals(mascota.getActivo()))
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una mascota activa con id " + mascotaId));
    }
}
