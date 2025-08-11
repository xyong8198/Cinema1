# Build stage
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace/app

# Install Maven
RUN apt-get update && apt-get install -y maven

# Copy project files
COPY pom.xml .
COPY src src

# Build a release artifact
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy the jar file from the build stage
COPY --from=build /workspace/app/target/absolute-cinema-0.0.1-SNAPSHOT.jar app.jar

# Make sure the app uses the PORT environment variable from Render
ENV PORT=8080

# Expose the port
EXPOSE ${PORT}

# Run the jar file
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "/app/app.jar"]