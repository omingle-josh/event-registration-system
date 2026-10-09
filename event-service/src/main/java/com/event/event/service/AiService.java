package com.event.event.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private final WebClient webClient;

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.model-id}")
    private String modelId;

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.groq.com/openai/v1").build();
    }

    public String generateEventDescription(String title) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("placeholder")) {
            log.error("Groq API key is missing or invalid.");
            throw new IllegalStateException("AI generation is temporarily unavailable.");
        }

        String prompt = "You are an expert event copywriter. Generate a compelling, professional event description for an event titled \"" +
                title + "\". Keep it strictly between 100-350 characters. " +
                "Use an exciting, persuasive tone. Highlight the key value for attendees. " +
                "Do not include the title verbatim at the start. No hashtags or emojis. " +
                "Just reply with the description, without any introductory conversational text.";
                
        Map<String, Object> requestBody = Map.of(
                "model", modelId,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 100
        );

        String fallbackResponse = "Join us for this amazing event! (AI description currently unavailable).";

        try {
            Map response = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(java.time.Duration.ofSeconds(10))
                    .retryWhen(reactor.util.retry.Retry.backoff(2, java.time.Duration.ofSeconds(2)))
                    .block();

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    if (message != null && message.containsKey("content")) {
                        return ((String) message.get("content")).trim();
                    }
                }
            }
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            String errorBody = e.getResponseBodyAsString();
            log.error("Groq API error: Status={}, Body={}", e.getStatusCode(), errorBody);
            return fallbackResponse;
        } catch (Exception e) {
            if (e.getCause() instanceof java.util.concurrent.TimeoutException) {
                log.error("Groq API timed out after retries.", e);
            } else {
                log.error("Unexpected error communicating with Groq API", e);
            }
            return fallbackResponse;
        }

        log.warn("AI generation returned empty or malformed response");
        return fallbackResponse;
    }

}
