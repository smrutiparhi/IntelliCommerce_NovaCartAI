# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Copy Maven wrapper and root pom first (cache-friendly)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Copy shared module
COPY shared/novacart-common/pom.xml shared/novacart-common/pom.xml
COPY shared/novacart-common/src     shared/novacart-common/src

# Copy this service's pom and source
COPY infra/eureka-server/pom.xml infra/eureka-server/pom.xml
COPY infra/eureka-server/src     infra/eureka-server/src

# Download deps (layer-cached; only re-runs when pom.xml changes)
RUN ./mvnw dependency:go-offline -B -pl infra/eureka-server -am -q

# Build the fat jar
RUN ./mvnw clean package -B -pl infra/eureka-server -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for least-privilege
RUN addgroup -S novacart && adduser -S novacart -G novacart
USER novacart

COPY --from=build /workspace/infra/eureka-server/target/eureka-server-*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]
