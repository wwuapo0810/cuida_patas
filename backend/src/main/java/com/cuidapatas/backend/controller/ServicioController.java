package com.cuidapatas.backend.controller;

import com.cuidapatas.backend.dto.ServicioResponse;
import com.cuidapatas.backend.repository.ServicioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Directorio de servicios. Por ahora solo lo consume el formulario de nueva cita
 * para elegir el lugar; los destacados van primero.
 */
@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioRepository servicioRepository;

    public ServicioController(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    @GetMapping
    public ResponseEntity<List<ServicioResponse>> listar() {
        return ResponseEntity.ok(servicioRepository.findAllByOrderByDestacadoDescNombreAsc().stream()
                .map(ServicioResponse::from)
                .toList());
    }
}
