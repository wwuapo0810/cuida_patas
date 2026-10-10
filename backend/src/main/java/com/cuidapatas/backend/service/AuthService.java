package com.cuidapatas.backend.service;

import com.cuidapatas.backend.dto.AuthResponse;
import com.cuidapatas.backend.dto.LoginRequest;
import com.cuidapatas.backend.dto.RegistroRequest;
import com.cuidapatas.backend.dto.UsuarioResponse;
import com.cuidapatas.backend.entity.Usuario;
import com.cuidapatas.backend.exception.CorreoYaRegistradoException;
import com.cuidapatas.backend.repository.UsuarioRepository;
import com.cuidapatas.backend.security.JwtService;
import com.cuidapatas.backend.security.UsuarioAutenticado;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registro y login: las dos únicas operaciones públicas de la API. */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /**
     * Crea la cuenta y devuelve el token ya emitido, para que el usuario quede con
     * la sesión abierta sin pasar por el login.
     *
     * El 'plan' no se recibe del cliente: la entidad lo deja en GRATUITO por
     * defecto y permitir elegirlo sería dejar que cualquiera se autoasigne PREMIUM.
     */
    @Transactional
    public AuthResponse registrar(RegistroRequest request) {
        String correo = normalizarCorreo(request.correo());

        /*
         * Esta comprobación es una cortesía para devolver un 409 con mensaje claro.
         * La garantía real la da el UNIQUE de la columna 'correo': si dos registros
         * entran a la vez, el segundo falla en el INSERT y lo atrapa el handler de
         * DataIntegrityViolationException.
         */
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new CorreoYaRegistradoException("Ya existe una cuenta con el correo " + correo);
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre().trim());
        usuario.setCorreo(correo);
        // Lo que se guarda es el hash BCrypt, nunca el texto plano recibido.
        usuario.setContrasena(passwordEncoder.encode(request.contrasena()));
        usuario.setTelefono(normalizarTelefono(request.telefono()));

        Usuario guardado = usuarioRepository.save(usuario);
        return construirRespuesta(guardado);
    }

    /**
     * Valida las credenciales y emite el token.
     *
     * La comparación la hace el AuthenticationManager (con BCrypt por detrás); si
     * falla lanza BadCredentialsException, que AuthExceptionHandler convierte en 401.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizarCorreo(request.correo()),
                        request.contrasena()));

        UsuarioAutenticado autenticado = (UsuarioAutenticado) autenticacion.getPrincipal();

        // Se recarga la entidad para devolver nombre, teléfono y plan al frontend.
        Usuario usuario = usuarioRepository.findById(autenticado.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "El usuario autenticado ya no existe: " + autenticado.getId()));

        return construirRespuesta(usuario);
    }

    /** Datos de la sesión actual, para que el frontend pueda restaurarla al recargar. */
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .map(UsuarioResponse::from)
                .orElseThrow(() -> new IllegalStateException(
                        "El usuario autenticado ya no existe: " + usuarioId));
    }

    private AuthResponse construirRespuesta(Usuario usuario) {
        String token = jwtService.generarToken(usuario.getId(), usuario.getCorreo());
        return new AuthResponse(token, jwtService.vigenciaEnSegundos(), UsuarioResponse.from(usuario));
    }

    /**
     * Minúsculas y sin espacios: evita que "Maria@X.com" y "maria@x.com" se
     * registren como dos cuentas distintas y que el login falle por un espacio
     * que el navegador agregó al autocompletar.
     */
    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase();
    }

    private String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            return null;
        }
        return telefono.trim();
    }
}
