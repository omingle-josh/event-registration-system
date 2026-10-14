# Setup

Steps to clone this repository and run the full stack: PostgreSQL, five Spring Boot services, the React app, and the optional Prometheus and Grafana containers.

## What you are starting

| Piece | Port | How it runs |
| :--- | :--- | :--- |
| Eureka | 8761 | Docker or Maven |
| API Gateway | 8080 | Docker or Maven. The browser talks only to this port. |
| Auth Service | 8081 | Docker or Maven |
| Event Service | 8082 | Docker or Maven |
| Socket.IO (inside Event Service) | 9092 | Starts with Event Service |
| Registration Service | 8083 | Docker or Maven |
| Frontend | 5173 | Always on the host with npm. It is not in Docker Compose. |
| Prometheus | 9090 | Docker Compose only |
| Grafana | 3000 | Docker Compose only. Login `admin` / `admin`. |

Auth, events, and registrations share **one PostgreSQL database** and use three schemas: `auth_db`, `event_db`, and `registration_db`. Hibernate creates the tables (`ddl-auto=update`). It does not create the schemas.

Every datasource is configured with `sslmode=require`. Use a Postgres host that supports SSL, such as [Neon](https://neon.tech). A local Postgres installed without SSL will refuse the connection.

## Prerequisites

**Docker path**

- Docker Engine and Docker Compose v2
- Node.js 18 or newer and npm (frontend only)
- A Postgres database that accepts SSL connections

Java and Maven are not required. The Dockerfiles compile the services.

**Local path**

- JDK 17
- Maven 3.9 or newer
- Node.js 18 or newer and npm
- The same SSL-capable Postgres database

Optional accounts, only if you use that feature:

- Google Cloud OAuth client, for Google sign-in
- Razorpay test keys, for paid registration
- Groq API key, for AI event copy

Email (password reset and receipts) uses the SMTP settings already in `auth-service` and `registration-service` `application.properties`. No mail variables go in `.env`.

## 1. Clone

```bash
git clone <repository-url>
cd event-registration-system
```

## 2. Environment file

```bash
cp .env.example .env
```

Edit `.env`. `.env` is gitignored. Do not commit it.

| Variable | Required | Notes |
| :--- | :--- | :--- |
| `DB_URL` | Yes | JDBC URL **without** a query string. Example: `jdbc:postgresql://HOST/neondb` |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Same value for every service. At least 32 characters. |
| `EUREKA_SERVER_URL` | Yes for local runs | `http://localhost:8761/eureka/`. Compose replaces this inside containers. |
| `GOOGLE_CLIENT_ID` | Yes | Auth Service will not start if this is missing. A placeholder is enough when you skip Google login. |
| `GOOGLE_CLIENT_SECRET` | Yes | Same as above. |
| `RAZORPAY_KEY_ID` | Yes | Registration Service will not start if this is missing. |
| `RAZORPAY_KEY_SECRET` | Yes | Same as above. |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Same as above. |
| `GROQ_API_KEY` | No | Leave empty to skip AI copy. |

`DB_URL` must not already contain `?sslmode=...`. Each service appends `?currentSchema=...`, and a second `?` makes the URL invalid. SSL is turned on in the service config, not in the URL.

If you run the backends **in Docker** and the database is on your machine, `localhost` inside a container is the container itself. Point `DB_URL` at a public host (Neon) or at `host.docker.internal`.

## 3. Create the schemas

Connect to the database named in `DB_URL` and run:

```sql
CREATE SCHEMA IF NOT EXISTS auth_db;
CREATE SCHEMA IF NOT EXISTS event_db;
CREATE SCHEMA IF NOT EXISTS registration_db;
```

On Neon, open the SQL editor for that database and run the same statements.

## 4. Start the backend

Use one of the two paths below.

### Docker Compose

From the repository root:

```bash
docker compose up --build -d
```

The first build compiles every service and can take several minutes. After that, wait 60–90 seconds for the apps to register with Eureka.

```bash
docker compose logs -f
```

Stop the stack with:

```bash
docker compose down
```

### Local Maven

Export the env file, then start Eureka and wait until `http://localhost:8761` loads before starting the other services. Use a separate terminal for each command.

```bash
set -a
source .env
set +a

mvn -pl eureka-server -am spring-boot:run
mvn -pl auth-service -am spring-boot:run
mvn -pl event-service -am spring-boot:run
mvn -pl registration-service -am spring-boot:run
mvn -pl api-gateway -am spring-boot:run
```

Prometheus and Grafana are not started on this path. Their scrape targets use Docker network names.

## 5. Start the frontend

The UI proxies `/api` to `http://localhost:8080`, so the gateway must already be up.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

You do not need a frontend `.env` for local development. `VITE_API_BASE_URL` defaults to `/api`. Set `VITE_API_BASE_URLS` only if you want extra fallback bases, for example `/api,/event-api`.

## 6. Check that it is up

1. Eureka dashboard: `http://localhost:8761`. You should see `API-GATEWAY`, `AUTH-SERVICE`, `EVENT-SERVICE`, and `REGISTRATION-SERVICE`.
2. Gateway health: `http://localhost:8080/actuator/health` returns `{"status":"UP"}`.
3. Frontend: `http://localhost:5173`.
4. Sign in with the admin account created on first auth-service startup:

   - Email: `admin@event.com`
   - Password: `admin123`

Public registration is `POST /auth/register` through the gateway, or the Sign Up page.

With Docker Compose you can also open Prometheus at `http://localhost:9090` and Grafana at `http://localhost:3000` (`admin` / `admin`).

## Google sign-in

In Google Cloud, create an OAuth 2.0 client and put its id and secret in `.env`. Authorized redirect URI:

```text
http://localhost:8080/login/oauth2/code/google
```

After login the API sends the browser to `http://localhost:5173/auth/oauth2/redirect`. Restart auth-service after changing the Google variables.

## Razorpay

Put test-mode key id, key secret, and webhook secret in `.env`, then restart registration-service. Point the Razorpay webhook at:

```text
http://localhost:8080/webhooks/razorpay
```

A public tunnel is required for Razorpay to reach your machine.

## Troubleshooting

**Service exits on startup with a missing placeholder.**  
`.env` is missing a required variable from the table above, or the process was started without that file loaded. Compose reads `.env` from the repo root automatically. Local Maven only sees variables you exported.

**`schema "auth_db" does not exist` (or `event_db` / `registration_db`).**  
Run the `CREATE SCHEMA` statements in section 3 against the database in `DB_URL`.

**SSL or "server does not support SSL".**  
The JDBC config forces SSL. Use Neon or another host with SSL enabled.

**Docker services cannot reach the database.**  
`DB_URL` uses `localhost`. From a container that is not the database. Use the hosted hostname, or `host.docker.internal` when Postgres is on the Docker host.

**Eureka is empty.**  
The other services started before Eureka was ready. Wait and restart api-gateway, auth-service, event-service, and registration-service.

**Frontend loads but API calls fail.**  
The gateway is not on port 8080, or the service you called is not registered in Eureka. Check `http://localhost:8761` before debugging the UI.

**Port already in use.**  
Free 5173, 8080–8083, 8761, and 9092. Compose also binds 3000 and 9090.
