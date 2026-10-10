package com.cuidapatas.backend.config;

import com.cuidapatas.backend.security.JwtAuthenticationFilter;
import com.cuidapatas.backend.security.ManejadorNoAutenticado;
import com.cuidapatas.backend.security.UsuarioDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración de seguridad de la API.
 *
 * Reglas:
 *  - Públicos: solo el registro, el login y el health check de Actuator.
 *  - Todo lo demás (incluidos /api/mascotas y los endpoints de salud) exige un
 *    JWT válido en el header Authorization.
 *  - Sin sesiones de servidor: el token es el único portador del estado.
 *
 * Este avance no distingue permisos por rol. La entidad Usuario todavía no tiene
 * campo 'rol', así que todos los usuarios autenticados pueden lo mismo. Cuando se
 * agregue, las reglas por rol van en authorizeHttpRequests con hasRole(...).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Orígenes autorizados a llamar la API desde el navegador. Viene de la variable
     * de entorno APP_CORS_ORIGINS; en desarrollo apunta al servidor de Vite.
     */
    private final List<String> origenesPermitidos;

    public SecurityConfig(@Value("${app.cors.origenes-permitidos}") List<String> origenesPermitidos) {
        this.origenesPermitidos = origenesPermitidos;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ManejadorNoAutenticado manejadorNoAutenticado) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // La protección CSRF está pensada para sesiones con cookies. Esta API es
                // stateless y se autentica con un header, así que no aplica.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Preflight del navegador: nunca lleva el header Authorization.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Lo único público del negocio.
                        .requestMatchers("/api/auth/registro", "/api/auth/login").permitAll()
                        // Sirve para verificar desde fuera que el backend y MySQL están arriba.
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        // Mascotas, vacunas, desparasitaciones, medicamentos y /api/auth/yo.
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(manejadorNoAutenticado))
                // El filtro JWT corre antes del de usuario/contraseña para que, cuando se
                // evalúan las reglas de autorización, el usuario ya esté en el contexto.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** BCrypt: el hash que la columna 'contrasena' ya tenía reservado (60 caracteres). */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Es lo que usa el login para comparar la contraseña recibida contra el hash
     * guardado, sin tener que hacerlo a mano.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            UsuarioDetailsService usuarioDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(usuarioDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origenesPermitidos);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
