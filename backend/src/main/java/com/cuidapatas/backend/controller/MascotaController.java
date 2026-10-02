package com.cuidapatas.backend.controller;

import com.cuidapatas.backend.dto.MascotaResponse;
import com.cuidapatas.backend.service.MascotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    private final MascotaService mascotaService;

    public MascotaController(MascotaService mascotaService) {
        this.mascotaService = mascotaService;
    }

    @GetMapping
    public ResponseEntity<List<MascotaResponse>> listar(
            @RequestParam(required = false) Long usuarioId) {
        return ResponseEntity.ok(mascotaService.listar(usuarioId));
    }
}
