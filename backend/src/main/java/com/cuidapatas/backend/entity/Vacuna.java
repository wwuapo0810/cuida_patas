package com.cuidapatas.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "vacuna")
@Getter
@Setter
@NoArgsConstructor
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vacuna")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    @NotBlank
    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @NotNull
    @PastOrPresent(message = "La fecha de aplicación no puede ser futura")
    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDate fechaAplicacion;

    /**
     * Fecha del próximo refuerzo. Es el dato del que depende el cálculo del estado
     * (al día / por vencer / vencido), que vive en la capa de servicios.
     */
    @Column(name = "proxima_fecha")
    private LocalDate proximaFecha;

    @Column(name = "veterinario", length = 120)
    private String veterinario;

    @Column(name = "observaciones", length = 500)
    private String observaciones;
}
