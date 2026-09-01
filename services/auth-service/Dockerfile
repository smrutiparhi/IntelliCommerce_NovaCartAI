# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY . .

RUN ./mvnw dependency:go-offline -B -pl services/auth-service -am -q

RUN ./mvnw clean package -B -pl services/auth-service -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S novacart && adduser -S novacart -G novacart
USER novacart

COPY --from=build /workspace/services/auth-service/target/auth-service-*.jar app.jar

# JWT key paths are mounted at runtime via Docker secrets / env vars.
# The container reads them from the host path set in JWT_PRIVATE_KEY_PATH /
# JWT_PUBLIC_KEY_PATH — mount the keys/ directory read-only.
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
