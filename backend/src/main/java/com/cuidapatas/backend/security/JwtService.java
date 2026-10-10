package com.cuidapatas.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Emite y verifica los tokens JWT.
 *
 * El token guarda el correo como 'subject' y el id del usuario en el claim 'uid',
 * para que el filtro no tenga que ir a la base de datos solo para saber quién es.
 * Firma HS256 con la clave de la variable de entorno JWT_SECRET.
 */
@Service
public class JwtService {

    /** Claim con el id del usuario (el 'subject' lleva el correo). */
    private static final String CLAIM_USUARIO_ID = "uid";

    private final SecretKey clave;
    private final Duration vigencia;

    public JwtService(
            @Value("${app.jwt.secreto}") String secreto,
            @Value("${app.jwt.expiracion-minutos}") long expiracionMinutos) {

        this.clave = construirClave(secreto);
        this.vigencia = Duration.ofMinutes(expiracionMinutos);
    }

    /**
     * HS256 exige una clave de al menos 256 bits (32 bytes). Si el secreto viene en
     * Base64 se decodifica; si no, se usan sus bytes UTF-8 tal cual. En ambos casos
     * se valida el largo aquí para fallar al arrancar con un mensaje claro, en vez
     * de descubrirlo en el primer login.
     */
    private static SecretKey construirClave(String secreto) {
        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(secreto);
        } catch (DecodingException noEsBase64) {
            // Ojo: JJWT lanza DecodingException, que NO hereda de
            // IllegalArgumentException. Atraparla es lo que permite usar un
            // secreto escrito en texto plano y no solo en Base64.
            bytes = secreto.getBytes(StandardCharsets.UTF_8);
        }

        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET demasiado corto: se requieren al menos 32 bytes (256 bits) para HS256. "
                            + "Generá uno con: openssl rand -base64 48");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generarToken(Long usuarioId, String correo) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(correo)
                .claim(CLAIM_USUARIO_ID, usuarioId)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(vigencia)))
                .signWith(clave)
                .compact();
    }

    /** Segundos de vida del token, para informarlo al frontend. */
    public long vigenciaEnSegundos() {
        return vigencia.toSeconds();
    }

    /**
     * Verifica firma y expiración, y devuelve el correo del token.
     *
     * @return el correo, o null si el token es inválido, expiró o fue manipulado.
     */
    public String extraerCorreo(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(clave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (JwtException | IllegalArgumentException tokenInvalido) {
            // Firma incorrecta, token expirado o malformado: se trata como "sin sesión".
            return null;
        }
    }
}
