package com.cuidapatas.backend.controller;

import com.cuidapatas.backend.dto.AuthResponse;
import com.cuidapatas.backend.dto.LoginRequest;
import com.cuidapatas.backend.dto.RegistroRequest;
import com.cuidapatas.backend.dto.UsuarioResponse;
import com.cuidapatas.backend.security.UsuarioAutenticado;
import com.cuidapatas.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de autenticación.
 *
 * /registro y /login son los dos únicos endpoints públicos de la API
 * (ver SecurityConfig). /yo ya exige token.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/registro — crea la cuenta y devuelve el token. */
    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    /** POST /api/auth/login — valida credenciales y devuelve el token. */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * GET /api/auth/yo — datos del usuario del token.
     *
     * El frontend lo llama al recargar la página para saber si el token guardado
     * sigue siendo válido antes de mostrar la aplicación.
     */
    @GetMapping("/yo")
    public ResponseEntity<UsuarioResponse> yo(@AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(authService.obtenerPerfil(autenticado.getId()));
    }
}
