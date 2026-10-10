package com.cuidapatas.backend.controller;

import com.cuidapatas.backend.dto.MascotaResponse;
import com.cuidapatas.backend.security.UsuarioAutenticado;
import com.cuidapatas.backend.service.MascotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    /**
     * GET /api/mascotas/{mascotaId} — una mascota concreta.
     *
     * Lo necesita la pantalla de perfil de mascota del frontend, que antes de
     * conectarse a la API mostraba datos escritos a mano.
     *
     * Solo devuelve mascotas del usuario autenticado: pedir el id de la mascota de
     * otra persona responde 404 (y no 403, que confirmaría que ese id existe).
     */
    @GetMapping("/{mascotaId}")
    public ResponseEntity<MascotaResponse> obtener(
            @PathVariable Long mascotaId,
            @AuthenticationPrincipal UsuarioAutenticado autenticado) {

        return ResponseEntity.ok(mascotaService.obtenerDeUsuario(mascotaId, autenticado.getId()));
    }
}
