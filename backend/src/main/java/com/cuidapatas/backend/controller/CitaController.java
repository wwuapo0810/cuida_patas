package com.cuidapatas.backend.controller;

import com.cuidapatas.backend.dto.CitaRequest;
import com.cuidapatas.backend.dto.CitaResponse;
import com.cuidapatas.backend.security.UsuarioAutenticado;
import com.cuidapatas.backend.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Agenda de citas. A diferencia de GET /api/mascotas, el usuario sale siempre del
 * token y nunca de un parámetro: cada quien ve y agenda solo para sus mascotas.
 */
@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    /** GET /api/citas — todas las citas de las mascotas del usuario autenticado. */
    @GetMapping
    public ResponseEntity<List<CitaResponse>> listar(@AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(citaService.listarDeUsuario(autenticado.getId()));
    }

    /** POST /api/citas — agenda una cita para una de sus mascotas. */
    @PostMapping
    public ResponseEntity<CitaResponse> crear(
            @AuthenticationPrincipal UsuarioAutenticado autenticado,
            @Valid @RequestBody CitaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(citaService.crear(autenticado.getId(), request));
    }
}
