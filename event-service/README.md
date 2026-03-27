# Event Logic Service (`:8082`)

The primary monolithic database interface coordinating Event entities, logical Venues, and physical Seat allocations. 

### Core Features:
1. **Optimistic Locking:** Implements `@Version` JPA controls to secure parallel ticket provisioning against hostile distributed race-conditions.
2. **Seat Management Pipeline:** Triggers active compensation bounds when the Registration hooks request cancellations/reservations.
3. **Decentralized Filtering:** Employs `JwtFilter` instances to unpack Gateway-approved access bounds dynamically without redundant database verifications.
