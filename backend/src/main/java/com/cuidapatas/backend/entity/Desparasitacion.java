package com.cuidapatas.backend.entity;

import com.cuidapatas.backend.entity.enums.TipoDesparasitacion;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "desparasitacion")
@Getter
@Setter
@NoArgsConstructor
public class Desparasitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoDesparasitacion tipo;

    @Column(name = "producto", length = 120)
    private String producto;

    @NotNull
    @PastOrPresent(message = "La fecha de aplicación no puede ser futura")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "proxima_fecha")
    private LocalDate proximaFecha;

    @Column(name = "observaciones", length = 500)
    private String observaciones;
}
