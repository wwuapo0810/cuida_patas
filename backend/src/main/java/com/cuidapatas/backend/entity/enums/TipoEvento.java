package com.cuidapatas.backend.entity.enums;

/**
 * Tipo del evento al que apunta un recordatorio.
 *
 * <p>Actúa como discriminador de la referencia polimórfica
 * {@code Recordatorio.idEvento}: indica en cuál de las cuatro tablas
 * hay que buscar ese identificador.
 */
public enum TipoEvento {
    VACUNA,
    DESPARASITACION,
    MEDICAMENTO,
    CITA
}
