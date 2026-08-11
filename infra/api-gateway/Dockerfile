# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

COPY shared/novacart-common/pom.xml shared/novacart-common/pom.xml
COPY shared/novacart-common/src     shared/novacart-common/src

COPY infra/api-gateway/pom.xml infra/api-gateway/pom.xml
COPY infra/api-gateway/src     infra/api-gateway/src

RUN ./mvnw dependency:go-offline -B -pl infra/api-gateway -am -q

RUN ./mvnw clean package -B -pl infra/api-gateway -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S novacart && adduser -S novacart -G novacart
USER novacart

COPY --from=build /workspace/infra/api-gateway/target/api-gateway-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
