package com.cuidapatas.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "medicamento")
@Getter
@Setter
@NoArgsConstructor
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    @NotBlank
    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "dosis", length = 80)
    private String dosis;

    @Positive(message = "La frecuencia debe ser mayor que cero")
    @Column(name = "frecuencia_horas")
    private Integer frecuenciaHoras;

    @NotNull
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    /** Nula significa tratamiento continuo, sin fecha de término definida. */
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "observaciones", length = 500)
    private String observaciones;
}
