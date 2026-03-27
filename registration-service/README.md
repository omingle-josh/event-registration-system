# Event Registration & Billing Service (`:8083`)

The transactional hub of the Event Platform securing physical ticket purchases, webhook validations, and digital artifact provisioning.

### Core Features:
1. **OpenFeign Client Interceptors:** Initiates programmatic internal HTTP handshakes natively bounded directly to the Event Service's capacity APIs.
2. **Razorpay Guard Clauses:** Employs rigorous Idempotent pipeline guards against external `payment.captured` webhooks to block duplicate validations organically.
3. **PDF Generator:** Automates secure receipt file production instantly appended against SQL data.

### Environment Context Requirements:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
