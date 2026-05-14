package com.upf.ride.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendVerificationCode(String toEmail, String firstName, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("UPF-Ride - Votre code de vérification");

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

            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification", e);
        }
    }
}
