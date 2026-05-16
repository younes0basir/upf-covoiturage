package com.upf.ride.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final WebClient resendClient;

    @Value("${app.resend.from-email}")
    private String fromEmail;

    public EmailService(@Value("${app.resend.api-key}") String apiKey) {
        log.info("EmailService initialized with from-email config. API key present: {}", apiKey != null && !apiKey.equals("placeholder"));
        this.resendClient = WebClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Async
    public void sendVerificationCode(String toEmail, String firstName, String code) {
        log.info("Attempting to send verification email to: {}", toEmail);
        try {
            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e40af; font-size: 28px; margin: 0;">
                            UPF<span style="color: #111827;">Ride</span>
                        </h1>
                    </div>
                    <div style="background: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                        <h2 style="color: #111827; margin-top: 0;">Bonjour %s !</h2>
                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
                            Voici votre code de vérification pour activer votre compte UPF-Ride :
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <div style="display: inline-block; background: #f0f4ff; border: 2px solid #2563eb; border-radius: 16px; padding: 20px 48px;">
                                <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1e40af;">%s</span>
                            </div>
                        </div>
                        <p style="color: #9ca3af; font-size: 13px; text-align: center;">
                            Ce code expire dans 15 minutes.<br/>
                            Si vous n'avez pas créé de compte, ignorez cet email.
                        </p>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                        © UPF-Ride - Université Privée de Fès
                    </p>
                </div>
                """.formatted(firstName, code);

            Map<String, Object> emailBody = Map.of(
                "from", fromEmail,
                "to", new String[]{toEmail},
                "subject", "UPF-Ride - Votre code de vérification",
                "html", html
            );

            log.info("Sending email via Resend: from={}, to={}", fromEmail, toEmail);

            String response = resendClient.post()
                    .uri("/emails")
                    .bodyValue(emailBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Resend email sent successfully to {}: {}", toEmail, response);
        } catch (WebClientResponseException e) {
            log.error("Resend API error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Erreur Resend: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification", e);
        }
    }
}
