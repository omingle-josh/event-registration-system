# Netflix Eureka Discovery Server (`:8761`)

The central nervous system of the Microservice Architecture topology. 

Instead of configuring brute-force IP addresses across disparate instances, microservices actively ping Eureka holding a "Heartbeat". If an instance silently crashes, Eureka seamlessly ejects it from the DNS routing tables to guarantee the `API Gateway` doesn't tunnel requests into dead computing voids.
