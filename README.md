# CuidaPatas

Aplicación para centralizar la salud, las citas y los recordatorios de las mascotas.

El repositorio tiene dos partes:

- **`src/`** — frontend en React + Vite (prototipo del primer avance)
- **`backend/`** — backend en Spring Boot + MySQL (segundo avance)

---

## Frontend

```bash
npm install
npm run dev
```

### Rutas

- `/login`
- `/mascotas/max`
- `/salud`
- `/citas`
- `/calendario`
- `/directorio`

Las rutas `/citas` y `/calendario` comparten la misma vista porque las dos capturas
entregadas para esas pantallas son idénticas.

---

## Backend

Corre completo en Docker: no hace falta instalar Java, Maven ni MySQL.

```bash
cp .env.example .env
docker compose up -d --build
```

Para comprobar que quedó levantado:

```bash
curl http://localhost:8080/actuator/health
```

Instrucciones completas, modelo de datos y siguientes pasos por persona:
[`backend/README.md`](backend/README.md).
