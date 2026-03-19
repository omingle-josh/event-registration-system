# Event Registration System

## Overview
A multi-module microservices project using Spring Boot for an Event Registration System.

## Architecture
- `eureka-server`: Centralized service discovery
- `api-gateway`: API Gateway for routing and cross-cutting concerns
- `auth-service`: Handles JWT authentication and security
- `event-service`: Manages events
- `registration-service`: Manages registrations for events

## Tech Stack
- Java 17+
- Spring Boot 3.x
- Spring Cloud (Netflix Eureka, Spring Cloud Gateway, OpenFeign)
- PostgreSQL
- Maven
- Lombok
- OpenAPI / Swagger
- Docker & Docker Compose

## Setup Instructions
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill out your specific values.
3. Build the modules: `mvn clean install`
4. Run the infrastructure via Docker: `docker-compose up -d`
5. Run the services individually or through Docker depending on your preference.
