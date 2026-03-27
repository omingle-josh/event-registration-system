# Auth Service (`:8081`)

Responsible for generating, cryptographically signing, and managing the lifecycle of distributed JWT tokens over the active user base.

### Key Responsibilities:
1. **JWT Provisioning:** Utilizes JJWT and the standard `HMAC-SHA256` array algorithm to emit tamper-proof web tokens explicitly storing `ROLE_` constants.
2. **Bcrypt Implementation:** Native password hashing sequence embedded in `AuthService`.
3. **RBAC Control:** Manages `ADMIN`, `ORGANIZER`, and `REGISTRANT` hierarchies structurally integrated within a raw PostgreSQL volume.

### Environment Variable Prerequisites:
- `JWT_SECRET`
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
