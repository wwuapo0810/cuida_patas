package com.cuidapatas.backend.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Pruebas del servicio JWT. No levantan el contexto de Spring ni necesitan base
 * de datos: se construye el servicio a mano con un secreto de prueba.
 */
class JwtServiceTest {

    /** Solo para las pruebas. El secreto real sale de la variable JWT_SECRET. */
    private static final String SECRETO_DE_PRUEBA =
            "secreto-de-prueba-con-mas-de-treinta-y-dos-bytes-0123456789";

    private final JwtService jwtService = new JwtService(SECRETO_DE_PRUEBA, 60);

    @Test
    void un_token_recien_generado_devuelve_el_correo_del_usuario() {
        String token = jwtService.generarToken(7L, "maria@correo.com");

        assertThat(jwtService.extraerCorreo(token)).isEqualTo("maria@correo.com");
    }

    @Test
    void la_vigencia_se_informa_en_segundos() {
        assertThat(jwtService.vigenciaEnSegundos()).isEqualTo(3600);
    }

    @Test
    void un_token_manipulado_no_se_acepta() {
        String token = jwtService.generarToken(7L, "maria@correo.com");

        // Se altera el último carácter: la firma deja de coincidir.
        String alterado = token.substring(0, token.length() - 1)
                + (token.endsWith("a") ? "b" : "a");

        assertThat(jwtService.extraerCorreo(alterado)).isNull();
    }

    @Test
    void un_token_firmado_con_otra_clave_no_se_acepta() {
        JwtService otroBackend = new JwtService(
                "otro-secreto-distinto-de-al-menos-treinta-y-dos-bytes-xyz", 60);
        String tokenAjeno = otroBackend.generarToken(7L, "maria@correo.com");

        assertThat(jwtService.extraerCorreo(tokenAjeno)).isNull();
    }

    @Test
    void un_token_vencido_no_se_acepta() {
        // Vigencia negativa: el token nace ya expirado.
        JwtService vencido = new JwtService(SECRETO_DE_PRUEBA, -1);
        String token = vencido.generarToken(7L, "maria@correo.com");

        assertThat(jwtService.extraerCorreo(token)).isNull();
    }

    @Test
    void texto_basura_no_rompe_el_filtro() {
        assertThat(jwtService.extraerCorreo("esto-no-es-un-jwt")).isNull();
    }

    @Test
    void un_secreto_corto_falla_al_construir_el_servicio() {
        assertThatThrownBy(() -> new JwtService("muy-corto", 60))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }
}
