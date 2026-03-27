# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/
COPY auth-service/pom.xml auth-service/
COPY eureka-server/pom.xml eureka-server/
COPY event-service/pom.xml event-service/
COPY registration-service/pom.xml registration-service/
COPY api-gateway/src api-gateway/src
RUN mvn clean package -pl api-gateway -am -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
