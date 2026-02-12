# Build stage
############################
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -q -e -DskipTests clean package

# Run stage
############################
FROM eclipse-temurin:21-jdk

# Create non-root user
RUN useradd -u 10001 -m appuser
USER appuser

WORKDIR /app

# Copy the JAR file from build stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]