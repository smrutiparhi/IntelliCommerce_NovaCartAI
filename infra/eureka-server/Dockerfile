# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# The root POM declares every backend module. Maven validates that complete
# reactor before applying -pl, so the build context must include all modules.
COPY . .

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
