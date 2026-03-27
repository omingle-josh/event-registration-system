# Master API Reference (API Gateway: `:8080`)

All API routes seamlessly tunnel through the **Spring Cloud API Gateway (`:8080`)**. The gateway strips JWTs internally and propagates role authorizations. **Never** ping backend service ports natively.

---

## 🔐 1. Authentication Endpoints (Public)

### `POST /auth/login`
**Description:** Authenticates user credentials and provisions a signed JWT.
* **Request Body:**
  ```json
  { "email": "admin@event.com", "password": "securepassword123" }
  ```
* **Success (200 OK):**
  ```json
  { "token": "ey..." }
  ```
* **Failure (400 Bad Request):** Invalid credentials.

### `POST /auth/register`
**Description:** Native public endpoint to create a base `REGISTRANT` account.
* **Request Body:**
  ```json
  { "name": "Jane", "email": "jane@example.com", "password": "password" }
  ```

---

## 🎟️ 2. Event Catalog & Administration 

### `GET /events` (Public)
**Description:** Retrieves a globally open catalog of all registered events.

### `POST /events/{eventId}/reserve-seat` *(Internal/Secured)*
**Description:** Isolated endpoint utilized implicitly by `OpenFeign` to claim an Atomic seat allocation.

---

## 🎫 3. Registration & Ticketing (Secured: `REGISTRANT`)

### `POST /registrations/{eventId}`
**Description:** Provisions a ticket to the active Event. Generates Razorpay order links instantly.
* **Authentication:** Requires `Bearer <JWT>`
* **Success (201 Created):**
  ```json
  { "id": 1, "paymentLink": "pay_..." }
  ```

### `POST /webhooks/razorpay` (Public / External)
**Description:** Asynchronous listener configured specifically to evaluate `payment.captured` and `payment.failed` cryptograms emitted globally. Extinguishes optimistic load balancers and triggers PDF generation scripts.
