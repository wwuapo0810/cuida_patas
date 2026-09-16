-- CuidaPatas — esquema inicial
-- Corresponde al diccionario de datos del Primer Avance: 8 entidades.
--
-- REGLA DEL EQUIPO: este archivo NO se edita una vez commiteado. Flyway guarda una
-- suma de verificación de cada migración ya aplicada; si se modifica, las bases de
-- los demás dejan de arrancar. Todo cambio de esquema va en un archivo nuevo:
-- V2__descripcion_del_cambio.sql, V3__..., etc.

-- ---------------------------------------------------------------------------
-- usuario
-- ---------------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario      BIGINT       NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(120) NOT NULL,
    correo          VARCHAR(160) NOT NULL,
    -- Hash BCrypt (60 caracteres). Nunca contraseñas en texto plano.
    contrasena      VARCHAR(100) NOT NULL,
    telefono        VARCHAR(30)  NULL,
    `plan`          VARCHAR(20)  NOT NULL,
    fecha_registro  DATETIME(6)  NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uk_usuario_correo UNIQUE (correo)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- servicio (directorio de veterinarias, tiendas, guarderías y estética)
-- ---------------------------------------------------------------------------
CREATE TABLE servicio (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(160) NOT NULL,
    tipo       VARCHAR(20)  NOT NULL,
    direccion  VARCHAR(255) NULL,
    telefono   VARCHAR(30)  NULL,
    horario    VARCHAR(160) NULL,
    destacado  BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_servicio PRIMARY KEY (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- mascota
-- ---------------------------------------------------------------------------
CREATE TABLE mascota (
    id_mascota        BIGINT       NOT NULL AUTO_INCREMENT,
    id_usuario        BIGINT       NOT NULL,
    nombre            VARCHAR(80)  NOT NULL,
    especie           VARCHAR(20)  NOT NULL,
    raza              VARCHAR(80)  NULL,
    sexo              VARCHAR(20)  NOT NULL,
    fecha_nacimiento  DATE         NULL,
    peso              DECIMAL(5,2) NULL,
    foto              VARCHAR(255) NULL,
    activo            BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_mascota PRIMARY KEY (id_mascota),
    CONSTRAINT fk_mascota_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    CONSTRAINT ck_mascota_peso CHECK (peso IS NULL OR peso > 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- vacuna
-- ---------------------------------------------------------------------------
CREATE TABLE vacuna (
    id_vacuna        BIGINT       NOT NULL AUTO_INCREMENT,
    id_mascota       BIGINT       NOT NULL,
    nombre           VARCHAR(120) NOT NULL,
    fecha_aplicacion DATE         NOT NULL,
    proxima_fecha    DATE         NULL,
    veterinario      VARCHAR(120) NULL,
    observaciones    VARCHAR(500) NULL,
    CONSTRAINT pk_vacuna PRIMARY KEY (id_vacuna),
    CONSTRAINT fk_vacuna_mascota FOREIGN KEY (id_mascota) REFERENCES mascota (id_mascota),
    CONSTRAINT ck_vacuna_fechas CHECK (proxima_fecha IS NULL OR proxima_fecha > fecha_aplicacion)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- desparasitacion
-- ---------------------------------------------------------------------------
CREATE TABLE desparasitacion (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    id_mascota     BIGINT       NOT NULL,
    tipo           VARCHAR(20)  NOT NULL,
    producto       VARCHAR(120) NULL,
    fecha          DATE         NOT NULL,
    proxima_fecha  DATE         NULL,
    observaciones  VARCHAR(500) NULL,
    CONSTRAINT pk_desparasitacion PRIMARY KEY (id),
    CONSTRAINT fk_desparasitacion_mascota FOREIGN KEY (id_mascota) REFERENCES mascota (id_mascota),
    CONSTRAINT ck_desparasitacion_fechas CHECK (proxima_fecha IS NULL OR proxima_fecha > fecha)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- medicamento
-- ---------------------------------------------------------------------------
CREATE TABLE medicamento (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    id_mascota        BIGINT       NOT NULL,
    nombre            VARCHAR(120) NOT NULL,
    dosis             VARCHAR(80)  NULL,
    frecuencia_horas  INT          NULL,
    fecha_inicio      DATE         NOT NULL,
    -- NULL = tratamiento continuo, sin fecha de término
    fecha_fin         DATE         NULL,
    observaciones     VARCHAR(500) NULL,
    CONSTRAINT pk_medicamento PRIMARY KEY (id),
    CONSTRAINT fk_medicamento_mascota FOREIGN KEY (id_mascota) REFERENCES mascota (id_mascota),
    CONSTRAINT ck_medicamento_frecuencia CHECK (frecuencia_horas IS NULL OR frecuencia_horas > 0),
    CONSTRAINT ck_medicamento_fechas CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- cita
-- ---------------------------------------------------------------------------
CREATE TABLE cita (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    id_mascota   BIGINT       NOT NULL,
    -- Opcional: se puede registrar una cita en un lugar que no está en el directorio
    id_servicio  BIGINT       NULL,
    fecha_hora   DATETIME(6)  NOT NULL,
    veterinario  VARCHAR(120) NULL,
    lugar        VARCHAR(160) NULL,
    motivo       VARCHAR(500) NULL,
    estado       VARCHAR(20)  NOT NULL,
    CONSTRAINT pk_cita PRIMARY KEY (id),
    CONSTRAINT fk_cita_mascota FOREIGN KEY (id_mascota) REFERENCES mascota (id_mascota),
    CONSTRAINT fk_cita_servicio FOREIGN KEY (id_servicio) REFERENCES servicio (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- recordatorio
-- ---------------------------------------------------------------------------
-- id_evento es una referencia POLIMÓRFICA: según tipo_evento apunta a vacuna,
-- desparasitacion, medicamento o cita. Por eso NO lleva clave foránea: una FK
-- relacional solo puede apuntar a una tabla. La integridad de esa referencia la
-- garantiza la capa de servicios, no la base de datos.
CREATE TABLE recordatorio (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    id_mascota    BIGINT      NOT NULL,
    tipo_evento   VARCHAR(20) NOT NULL,
    id_evento     BIGINT      NOT NULL,
    fecha_evento  DATE        NOT NULL,
    dias_antes    INT         NOT NULL DEFAULT 7,
    enviado       BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_recordatorio PRIMARY KEY (id),
    CONSTRAINT fk_recordatorio_mascota FOREIGN KEY (id_mascota) REFERENCES mascota (id_mascota),
    CONSTRAINT ck_recordatorio_dias CHECK (dias_antes > 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- Índices de apoyo para las consultas más frecuentes.
-- Las columnas de clave foránea ya llevan índice automático de InnoDB.
-- ---------------------------------------------------------------------------
CREATE INDEX ix_vacuna_proxima_fecha          ON vacuna (proxima_fecha);
CREATE INDEX ix_desparasitacion_proxima_fecha ON desparasitacion (proxima_fecha);
CREATE INDEX ix_cita_fecha_hora               ON cita (fecha_hora);
CREATE INDEX ix_recordatorio_pendientes       ON recordatorio (enviado, fecha_evento);
