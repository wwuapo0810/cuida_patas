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

    @Transactional(readOnly = true)
    public Mascota obtenerActiva(Long mascotaId) {
        return mascotaRepository.findById(mascotaId)
                .filter(mascota -> Boolean.TRUE.equals(mascota.getActivo()))
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una mascota activa con id " + mascotaId));
    }
}
