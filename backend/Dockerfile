# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
COPY script_python ./script_python
RUN mvn package -DskipTests

# Runtime stage
FROM openjdk:17-jdk-slim
WORKDIR /app

# Install Python and create venv
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Copy artifacts
COPY --from=build /app/target/*.jar app.jar
COPY --from=build /app/script_python /app/script_python

# Setup Python virtual environment
RUN cd /app/script_python && \
    python3 -m venv venv && \
    ./venv/bin/pip install --no-cache-dir -r requirements.txt

# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]