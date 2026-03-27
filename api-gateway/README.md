# API Gateway (`:8080`)

This module functions as the solitary entry point to the Event Registration backend logic cluster. 

### Key Responsibilities:
1. **Dynamic Routing:** Utilizes Spring Cloud's intrinsic networking to tunnel standard HTTP traffic to dynamic instances of microservices cached in the Eureka Discovery table.
2. **Global Edge Security:** Ingests the `AuthenticationFilter.java` algorithm to execute native JWT structure checks without compromising backend node computation times.
3. **CORS Enforcement:** Secures browser telemetry and domain restrictions.

### Running Natively:
```bash
mvn clean spring-boot:run
```
