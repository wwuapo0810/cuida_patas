package com.cuidapatas.backend.entity;

import com.cuidapatas.backend.entity.enums.TipoEvento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "recordatorio")
@Getter
@Setter
@NoArgsConstructor
public class Recordatorio {

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
    @Column(name = "tipo_evento", nullable = false, length = 20)
    private TipoEvento tipoEvento;

    /**
     * Identificador del evento recordado, en la tabla que indica {@link #tipoEvento}.
     *
     * <p><strong>Deliberadamente NO es una relación JPA ni una clave foránea.</strong>
     * Es una referencia polimórfica: según {@code tipoEvento} apunta a {@code vacuna},
     * {@code desparasitacion}, {@code medicamento} o {@code cita}. Una FK relacional solo
     * puede apuntar a una tabla, así que no es modelable con {@code @ManyToOne}.
     *
     * <p>No convertir esto en una relación: rompería el diseño acordado en el Primer Avance.
     * La alternativa normalizada sería una tabla puente por tipo de evento, que se descartó
     * por complejidad frente al alcance del proyecto.
     */
    @NotNull
    @Column(name = "id_evento", nullable = false)
    private Long idEvento;

    @NotNull
    @Column(name = "fecha_evento", nullable = false)
    private LocalDate fechaEvento;

    /** Días de antelación con que se envía el aviso. */
    @Positive
    @Column(name = "dias_antes", nullable = false)
    private Integer diasAntes = 7;

    @Column(name = "enviado", nullable = false)
    private Boolean enviado = false;
}
