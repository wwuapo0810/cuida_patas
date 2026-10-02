package com.cuidapatas.backend.entity;

import com.cuidapatas.backend.entity.enums.Plan;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @NotBlank
    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @NotBlank
    @Email
    @Column(name = "correo", nullable = false, unique = true, length = 160)
    private String correo;

    /**
     * Hash BCrypt de la contraseña, nunca el texto plano.
     * El cifrado se implementa junto con Spring Security; aquí solo se reserva
     * la columna con largo suficiente (BCrypt produce 60 caracteres).
     */
    @NotBlank
    @Column(name = "contrasena", nullable = false, length = 100)
    private String contrasena;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 20)
    private Plan plan = Plan.GRATUITO;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    /** Borrado lógico: un usuario inactivo conserva su historial. */
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @OneToMany(mappedBy = "usuario")
    private List<Mascota> mascotas = new ArrayList<>();

    @PrePersist
    void alCrear() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
