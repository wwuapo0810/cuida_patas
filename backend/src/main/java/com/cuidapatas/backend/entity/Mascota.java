package com.cuidapatas.backend.entity;

import com.cuidapatas.backend.entity.enums.Especie;
import com.cuidapatas.backend.entity.enums.Sexo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mascota")
@Getter
@Setter
@NoArgsConstructor
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mascota")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @NotBlank
    @Column(name = "nombre", nullable = false, length = 80)
    private String nombre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "especie", nullable = false, length = 20)
    private Especie especie;

    @Column(name = "raza", length = 80)
    private String raza;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false, length = 20)
    private Sexo sexo;

    @PastOrPresent(message = "La fecha de nacimiento no puede ser futura")
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Positive(message = "El peso debe ser mayor que cero")
    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    /** Ruta o URL de la foto de perfil. El almacenamiento del archivo queda fuera de este avance. */
    @Column(name = "foto", length = 255)
    private String foto;

    /** Borrado lógico: la mascota desaparece de los listados pero conserva su historial de salud. */
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @OneToMany(mappedBy = "mascota")
    private List<Vacuna> vacunas = new ArrayList<>();

    @OneToMany(mappedBy = "mascota")
    private List<Desparasitacion> desparasitaciones = new ArrayList<>();

    @OneToMany(mappedBy = "mascota")
    private List<Medicamento> medicamentos = new ArrayList<>();

    @OneToMany(mappedBy = "mascota")
    private List<Cita> citas = new ArrayList<>();

    @OneToMany(mappedBy = "mascota")
    private List<Recordatorio> recordatorios = new ArrayList<>();
}
