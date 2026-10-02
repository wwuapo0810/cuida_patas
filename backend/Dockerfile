# ---------------------------------------------------------------------------
# Etapa 1: compilación
# Se hace dentro de Docker a propósito: nadie del equipo necesita instalar
# Java ni Maven en su máquina.
# ---------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# El pom se copia solo primero para que Docker cachee la descarga de dependencias:
# mientras el pom no cambie, no se vuelven a bajar en cada build.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
# Sin tests: los de integración necesitan la base de datos levantada, y durante
# el build todavía no existe. Se corren con el stack arriba.
RUN mvn -B clean package -DskipTests

# ---------------------------------------------------------------------------
# Etapa 2: ejecución
# Solo el JRE y el jar: la imagen final no lleva Maven ni el JDK completo.
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuario sin privilegios: si alguien compromete la aplicación, no es root.
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar

USER spring:spring
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=10 \
    CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
