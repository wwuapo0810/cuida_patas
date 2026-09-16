# CuidaPatas — backend

Capa de persistencia de CuidaPatas: Spring Boot 3.3 + MySQL 8.4, con las 8 entidades
del diccionario de datos del Primer Avance. Todo corre en Docker.

---

## Alcance: qué incluye y qué no

Esta entrega corresponde a **la base de datos y el arranque del backend**. Es
deliberadamente la capa de abajo, para que el resto del equipo construya encima sin
pisarse.

**Incluye**

- Proyecto Spring Boot conectado a MySQL
- Las 8 entidades JPA con sus relaciones
- Los 8 repositorios Spring Data
- Esquema versionado con Flyway
- Todo dockerizado: no hay que instalar Java, Maven ni MySQL

**No incluye** (y no debería agregarse aquí sin hablarlo con quien corresponde)

| Falta | De quién es |
|---|---|
| Controladores REST, DTOs, cálculo del estado al día / por vencer / vencido | Andrey |
| Spring Security, BCrypt, JWT, protección de rutas | Josué |
| Conexión del frontend React | Laura |
| Despliegue público, QR, datos de prueba | Jonathan |

Si abrís este proyecto y no ves endpoints, no es un error: todavía no existen.

---

## Requisitos

Solo **Docker Desktop** (o Docker Engine + Compose v2). Nada más.

Verificá que lo tenés:

```bash
docker --version
docker compose version
```

---

## Cómo levantarlo

Desde la **raíz del repositorio** (no desde `backend/`):

```bash
cp .env.example .env
docker compose up -d --build
```

La primera vez tarda varios minutos porque descarga las dependencias de Maven. Las
siguientes son rápidas: Docker cachea esa capa mientras no cambie el `pom.xml`.

---

## Cómo verificar que quedó bien

Los cinco pasos, en orden. Si los cinco pasan, la entrega está completa.

**1. Los dos contenedores levantados y sanos**

```bash
docker compose ps
```

Se esperan `cuidapatas-mysql` y `cuidapatas-backend`, ambos con estado `healthy`.
El backend tarda entre 30 y 60 segundos en pasar a `healthy` la primera vez.

**2. El backend arrancó y Flyway aplicó la migración**

```bash
docker compose logs backend --tail=100
```

Buscar dos cosas:

- `Successfully applied 1 migration` (Flyway creó el esquema)
- `Started CuidapatasBackendApplication in X seconds`

No debe haber trazas de excepción.

**3. La aplicación responde y la base está conectada**

```bash
curl http://localhost:8080/actuator/health
```

Debe devolver `"status":"UP"` y, dentro de `components.db`, también `"status":"UP"`.
Ese segundo dato es el que prueba que la conexión a MySQL funciona de verdad.

**4. Las 8 tablas existen**

```bash
docker compose exec mysql mysql -u root -proot_dev_2026 -e "USE cuidapatas; SHOW TABLES;"
```

Se esperan 9 filas: las 8 tablas del modelo más `flyway_schema_history`, que es la
bitácora de migraciones de Flyway.

**5. Reiniciar no vuelve a aplicar la migración**

```bash
docker compose restart backend
docker compose logs backend --tail=30
```

Ahora debe decir algo como `Schema "cuidapatas" is up to date. No migration necessary`.
Si volviera a aplicar la V1, algo está mal.

### Apagar

```bash
docker compose down        # detiene, conserva los datos
docker compose down -v     # detiene y BORRA la base de datos
```

---

## Las 8 entidades

Los nombres de columna respetan el diccionario de datos del Primer Avance.

| Tabla | Clave primaria | Claves foráneas | Campos propios |
|---|---|---|---|
| `usuario` | `id_usuario` | — | nombre, correo (único), contrasena, telefono, plan, fecha_registro, activo |
| `mascota` | `id_mascota` | `id_usuario` | nombre, especie, raza, sexo, fecha_nacimiento, peso, foto, activo |
| `vacuna` | `id_vacuna` | `id_mascota` | nombre, fecha_aplicacion, proxima_fecha, veterinario, observaciones |
| `desparasitacion` | `id` | `id_mascota` | tipo, producto, fecha, proxima_fecha, observaciones |
| `medicamento` | `id` | `id_mascota` | nombre, dosis, frecuencia_horas, fecha_inicio, fecha_fin, observaciones |
| `cita` | `id` | `id_mascota`, `id_servicio` (opcional) | fecha_hora, veterinario, lugar, motivo, estado |
| `servicio` | `id` | — | nombre, tipo, direccion, telefono, horario, destacado |
| `recordatorio` | `id` | `id_mascota` | tipo_evento, id_evento, fecha_evento, dias_antes, enviado |

### Enumeraciones

Se guardan como texto, no como número, para que la base se pueda leer directamente
durante la demostración.

| Enum | Valores |
|---|---|
| `Plan` | GRATUITO, PREMIUM |
| `Especie` | PERRO, GATO |
| `Sexo` | MACHO, HEMBRA |
| `TipoDesparasitacion` | INTERNA, EXTERNA |
| `EstadoCita` | PROGRAMADA, REALIZADA, CANCELADA |
| `TipoServicio` | VETERINARIA, TIENDA, GUARDERIA, ESTETICA |
| `TipoEvento` | VACUNA, DESPARASITACION, MEDICAMENTO, CITA |

### Dos decisiones que conviene no revertir sin pensarlo

**`recordatorio.id_evento` no tiene clave foránea.** Es una referencia polimórfica:
según `tipo_evento`, apunta a `vacuna`, `desparasitacion`, `medicamento` o `cita`. Una
clave foránea relacional solo puede apuntar a una tabla, así que no es modelable. Quien
escriba la lógica de recordatorios tiene que resolver esa referencia a mano.

**El borrado es lógico, no físico.** `usuario` y `mascota` tienen columna `activo`. Dar
de baja una mascota es poner `activo = false`, no borrar la fila, para no perder el
historial de salud asociado.

---

## Variables de entorno

Viven en `.env` en la raíz del repositorio, que **no se sube al repositorio**. El archivo
`.env.example` es la plantilla.

| Variable | Para qué |
|---|---|
| `MYSQL_DATABASE` | Nombre de la base de datos |
| `MYSQL_USER` / `MYSQL_PASSWORD` | Usuario con el que se conecta la aplicación |
| `MYSQL_ROOT_PASSWORD` | Usuario root de MySQL, para inspeccionar la base a mano |
| `MYSQL_PORT` | Puerto expuesto de MySQL (cambiar si ya hay un MySQL local ocupando el 3306) |
| `BACKEND_PORT` | Puerto expuesto del backend |

---

## Siguientes pasos, por persona

### Andrey — API REST

Los repositorios ya existen; no hace falta crearlos. Están en
`com.cuidapatas.backend.repository`:

`UsuarioRepository`, `MascotaRepository`, `VacunaRepository`,
`DesparasitacionRepository`, `MedicamentoRepository`, `CitaRepository`,
`ServicioRepository`, `RecordatorioRepository`

Todos extienden `JpaRepository`, así que ya traen `findAll`, `findById`, `save`,
`deleteById` y paginación. Además hay algunos métodos de consulta útiles, por ejemplo
`VacunaRepository.findByMascotaIdOrderByProximaFechaAsc(...)` y
`MascotaRepository.countByUsuarioIdAndActivoTrue(...)`, este último para el límite de 2
mascotas del plan gratuito.

Lo que falta crear: paquetes `controller`, `service` y `dto` dentro de
`com.cuidapatas.backend`.

El cálculo del estado va en la capa de servicios, sobre las fechas que ya están
guardadas (`proxima_fecha` en vacunas y desparasitaciones, `fecha_fin` en medicamentos,
`fecha_hora` en citas). La regla acordada: más de 15 días es **al día**, 15 días o menos
es **por vencer**, fecha pasada es **vencido**. Ese estado no se guarda en la base: se
calcula al momento de consultar.

### Josué — Autenticación

La columna `usuario.contrasena` ya existe como `VARCHAR(100)`, con espacio de sobra para
un hash BCrypt (ocupa 60 caracteres). Hoy guarda lo que le pongan: el cifrado es tuyo.

`UsuarioRepository.findByCorreo(String)` devuelve un `Optional<Usuario>` y es el punto de
entrada natural para el login. También está `existsByCorreo(String)` para validar el
registro.

Hay que agregar `spring-boot-starter-security` y la librería de JWT al `pom.xml`.

### Laura — Frontend

Esta entrega no te desbloquea directamente: dependés de los endpoints que exponga
Andrey. Lo que sí conviene revisar desde ya es qué nombres de campo usa el modelo, para
que el front hable el mismo idioma que la API (ver la tabla de entidades más arriba).

### Jonathan — Despliegue y datos de prueba

Podés agregar un servicio `frontend` al `docker-compose.yml` de la raíz, dentro de la red
`cuidapatas-net`, sin tocar nada de `backend/`.

Para cargar datos de prueba hay dos caminos. El recomendado es un archivo Flyway nuevo
(`V2__datos_de_prueba.sql`), porque así los datos viajan con el repositorio y todos
tienen lo mismo. El otro es insertarlos a mano con `docker compose exec mysql mysql ...`,
que es más rápido pero se pierde al hacer `docker compose down -v`.

---

## Convención de migraciones

El esquema lo maneja Flyway, no Hibernate. La aplicación arranca con
`ddl-auto: validate`: compara las entidades contra las tablas reales y **falla al
arrancar** si no coinciden. Eso es intencional — evita que la base del equipo se
desincronice en silencio.

En la práctica esto significa:

1. **Nunca edites `V1__crear_esquema_inicial.sql`.** Flyway guarda una suma de
   verificación; si cambia, las bases de los demás dejan de arrancar.
2. Todo cambio de esquema va en un archivo nuevo: `V2__lo_que_cambia.sql`,
   `V3__...`, numerados en orden.
3. Si agregás un campo a una entidad, agregá la columna en una migración nueva **en el
   mismo commit**. Si no, la aplicación no arranca.

---

## Problemas comunes

**El puerto 3306 ya está en uso.** Suele ser un MySQL local o XAMPP. Cambiá
`MYSQL_PORT=3307` en tu `.env` y volvé a levantar. Lo mismo con `BACKEND_PORT` si el
8080 está ocupado. Esto solo cambia el puerto que se ve desde tu máquina; entre
contenedores se siguen hablando por el 3306 y no hay que tocar nada más.

**`Flyway upgrade recommended: MySQL 8.4 ... support has not been tested`.** Aparece en
cada arranque y **se puede ignorar**. Flyway declara soporte probado hasta MySQL 8.1,
pero funciona bien con 8.4 para el DDL que usa este proyecto (está verificado: aplica y
valida la migración correctamente). No conviene bajar MySQL a 8.0 para silenciarlo,
porque esa versión ya salió de soporte y 8.4 es la LTS actual.

**`Validation failed: missing column [...]`.** Una entidad tiene un campo que no existe
en la base. Alguien agregó un `@Column` sin la migración correspondiente. La solución es
escribir la migración que falta, no cambiar `ddl-auto`.

**`Migration checksum mismatch`.** Alguien editó una migración ya aplicada. En desarrollo
se arregla con `docker compose down -v` y volver a levantar, que recrea la base desde
cero. Contra una base con datos que importan, no: ahí hay que revertir el archivo a como
estaba.

**El backend arranca y se cae enseguida.** Casi siempre es que MySQL todavía no estaba
listo. El compose ya espera a que esté sano, pero si pasa, mirá `docker compose logs
backend` para ver el error real.
