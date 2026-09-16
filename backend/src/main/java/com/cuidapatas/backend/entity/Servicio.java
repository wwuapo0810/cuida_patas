package com.cuidapatas.backend.entity;

import com.cuidapatas.backend.entity.enums.TipoServicio;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "servicio")
@Getter
@Setter
@NoArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Column(name = "nombre", nullable = false, length = 160)
    private String nombre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoServicio tipo;

    @Column(name = "direccion", length = 255)
    private String direccion;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "horario", length = 160)
    private String horario;

    /** Comercio patrocinado: aparece resaltado en el directorio. Sostiene el modelo de ingreso. */
    @Column(name = "destacado", nullable = false)
    private Boolean destacado = false;
}
