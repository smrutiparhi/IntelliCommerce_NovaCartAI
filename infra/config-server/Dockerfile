# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY . .

RUN ./mvnw dependency:go-offline -B -pl infra/config-server -am -q

RUN ./mvnw clean package -B -pl infra/config-server -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S novacart && adduser -S novacart -G novacart
USER novacart

COPY --from=build /workspace/infra/config-server/target/config-server-*.jar app.jar

EXPOSE 8888

ENTRYPOINT ["java", "-jar", "app.jar"]
