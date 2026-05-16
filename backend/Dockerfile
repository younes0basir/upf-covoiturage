# Stage 1: Build
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy maven wrapper and pom
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy the jar from the build stage
# Note: The jar name matches the <artifactId>-<version>.jar in your pom.xml
COPY --from=build /app/target/upf-ride-1.0.0.jar app.jar

# Set environment defaults
ENV PORT=8080
EXPOSE ${PORT}

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
