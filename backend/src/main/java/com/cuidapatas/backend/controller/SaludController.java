package com.cuidapatas.backend.controller;

import com.cuidapatas.backend.dto.DesparasitacionRequest;
import com.cuidapatas.backend.dto.DesparasitacionResponse;
import com.cuidapatas.backend.dto.MedicamentoRequest;
import com.cuidapatas.backend.dto.MedicamentoResponse;
import com.cuidapatas.backend.dto.VacunaRequest;
import com.cuidapatas.backend.dto.VacunaResponse;
import com.cuidapatas.backend.service.SaludService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas/{mascotaId}")
public class SaludController {

    private final SaludService saludService;

    public SaludController(SaludService saludService) {
        this.saludService = saludService;
    }

    @GetMapping("/vacunas")
    public ResponseEntity<List<VacunaResponse>> listarVacunas(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(saludService.listarVacunas(mascotaId));
    }

    @PostMapping("/vacunas")
    public ResponseEntity<VacunaResponse> crearVacuna(
            @PathVariable Long mascotaId,
            @Valid @RequestBody VacunaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(saludService.crearVacuna(mascotaId, request));
    }

    @GetMapping("/desparasitaciones")
    public ResponseEntity<List<DesparasitacionResponse>> listarDesparasitaciones(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(saludService.listarDesparasitaciones(mascotaId));
    }

    @PostMapping("/desparasitaciones")
    public ResponseEntity<DesparasitacionResponse> crearDesparasitacion(
            @PathVariable Long mascotaId,
            @Valid @RequestBody DesparasitacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(saludService.crearDesparasitacion(mascotaId, request));
    }

    @GetMapping("/medicamentos")
    public ResponseEntity<List<MedicamentoResponse>> listarMedicamentos(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(saludService.listarMedicamentos(mascotaId));
    }

    @PostMapping("/medicamentos")
    public ResponseEntity<MedicamentoResponse> crearMedicamento(
            @PathVariable Long mascotaId,
            @Valid @RequestBody MedicamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(saludService.crearMedicamento(mascotaId, request));
    }
}
