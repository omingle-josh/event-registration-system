# Event Registration Platform - Microservice Architecture 🚀

An enterprise-grade, distributed Event Registration and Ticketing platform built natively on **Spring Boot 3**. This system leverages a modern microservice topology, resilient inter-service communication via **OpenFeign**, and decentralized stateless security through **JSON Web Tokens (JWT)**.

---

## 🏗️ System Architecture

The architecture relies on an **API Gateway** acting as the sole entry point, dynamically load-balancing traffic to backend microservices via the **Eureka Service Registry**.

### 🧩 Core Microservices:
| Service | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `:8080` | Reverse proxy and centralized global security perimeter. Blocks unauthorized traffic before it reaches backend services. |
| **Eureka Server** | `:8761` | Netflix Eureka Discovery Server. Maps service names to live IP addresses. |
| **Auth Service** | `:8081` | Handles user authentication, registration, `ROLE` provisioning, and issues signed stateless JWTs. |
| **Event Service** | `:8082` | Source of truth for Event catalogs, category mappings, and atomic Seat Capacity management (Optimistic Locking). |
| **Registration Service** | `:8083` | Handles ticketing logic, Webhook ingestion (Razorpay), cryptographic proofs, and async PDF Receipt generation. |

---

## 🛠️ Technology Stack
- **Framework Core:** Java 17, Spring Boot 3.2, Spring Data JPA
- **Cloud/Routing:** Spring Cloud Gateway, Netflix Eureka
- **Security:** Spring Security 6, JWT (Decentralized Decoding), BCrypt
- **Database Architecture:** Database-per-service (3 independent PostgreSQL nodes)
- **Payment Gateway:** Razorpay SDK (HMAC SHA-256 Webhooks)
- **DevOps:** Multi-Stage Docker & Docker Compose orchestration

---

## 🔒 Security Posture
The networking layer isolates the backend instances. The API Gateway permits public traffic directly exclusively to the `/auth/**` login/registration endpoints.
All other traffic mapping to `/admin/**`, `/events/**`, and `/registrations/**` triggers the `AuthenticationFilter.java` interceptor, requiring a cryptographically valid `Bearer <Token>`.

Downstream `JwtFilter`s rigorously evaluate the unpacked JWT scopes logically mapping to `ROLE_ADMIN`, `ROLE_ORGANIZER`, or `ROLE_REGISTRANT` using native Spring declarative expressions (`@PreAuthorize`).

---

## 🚀 Quickstart via Docker Compose

This platform is container-native. You do not explicitly need Java or Maven installed on your host OS. The multi-stage `Dockerfile` templates will automatically inject the parent POM context and natively compile the system isolated within Docker networks.

### 1. Configure the Environment Nodes
Clone the repository and duplicate the environment template:
```bash
cp .env.example .env
```
Populate `.env` with your active PostgreSQL URIs and Razorpay cryptographic secrets.

### 2. Orchestrate the Cluster
Initiate the dynamic build sequence from the repository root:
```bash
docker-compose up --build -d
```
Docker will boot the registry, compile the JARs, and bridge the internal networks.

### 3. Verify Health
Wait 60-90 seconds for all Spring applications to push initialization telemetry to Eureka:
```bash
docker-compose logs -f
```

---

## 📚 API Endpoints
All traffic MUST explicitly flow via the API Gateway endpoint (`localhost:8080`).

- **POST** `/auth/login` (Public - Obtain JWT)
- **POST** `/auth/register` (Public - Register as REGISTRANT)
- **GET** `/events` (Public - View global catalog)
- **POST** `/registrations/{eventId}` (Secured - Requires REGISTRANT or ADMIN JWT)
- **POST** `/admin/events` (Secured - Requires ADMIN JWT)
- **POST** `/webhooks/razorpay` (Public - Ingests programmatic automated server hooks)

---
*Built organically for highly scalable, idempotent ticketing registration networks.*
