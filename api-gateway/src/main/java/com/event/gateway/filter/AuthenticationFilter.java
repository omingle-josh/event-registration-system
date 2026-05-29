package com.event.gateway.filter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {



    @Autowired
    private com.event.gateway.util.JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String requestPath = request.getURI().getPath();

            // Allow CORS preflight and public event reads through the gateway.
            if (HttpMethod.OPTIONS.equals(request.getMethod())
                    || requestPath.startsWith("/auth/")
                    || requestPath.startsWith("/oauth2/")
                    || requestPath.startsWith("/login/oauth2/")
                    || requestPath.startsWith("/webhooks/")
                    || (HttpMethod.GET.equals(request.getMethod())
                    && requestPath.startsWith("/events")
                    && !requestPath.startsWith("/events/admin")
                    && !requestPath.startsWith("/events/organizer"))) {
                return chain.filter(exchange);
            }

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid authorization header format", HttpStatus.UNAUTHORIZED);
            }

            try {
                String token = authHeader.substring(7);
                jwtUtil.validateToken(token);
            } catch (Exception e) {
                return onError(exchange, "Unauthorized access to application", HttpStatus.UNAUTHORIZED);
            }

            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("error", err);
        return response.setComplete();
    }

    public static class Config {
    }
}
