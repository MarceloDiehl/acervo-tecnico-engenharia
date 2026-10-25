package tjrs.dipred.acervo.config;

import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

import jakarta.servlet.http.HttpServletResponse;

/*
 * Consulta e download são livres (o sigilo é conferido no serviço).
 * Incluir e editar exigem login (técnico ou gestor); corrigir classificação,
 * excluir e restaurar da lixeira são só do gestor. Login por HTTP Basic, como no dipred_dman.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.PUT, "/api/documentos/*/classificacao").hasRole("GESTOR")
                        .requestMatchers("/api/documentos/*/exclusoes", "/api/exclusoes/**").hasRole("GESTOR")
                        .requestMatchers(HttpMethod.POST, "/api/documentos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/documentos/**").authenticated()
                        .anyRequest().permitAll()
                )
                .httpBasic(basic -> basic.authenticationEntryPoint(semJanelaDeLogin()))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(semJanelaDeLogin())
                        .accessDeniedHandler(semPermissao()));
        return http.build();
    }

    /* 401 sem o cabeçalho WWW-Authenticate, para o navegador não abrir a janela de login dele */
    private AuthenticationEntryPoint semJanelaDeLogin() {
        return (request, response, ex) -> erro(response, HttpServletResponse.SC_UNAUTHORIZED, "É preciso entrar com usuário e senha.");
    }

    private AccessDeniedHandler semPermissao() {
        return (request, response, ex) -> erro(response, HttpServletResponse.SC_FORBIDDEN, "Seu perfil não permite esta ação.");
    }

    private static void erro(HttpServletResponse response, int status, String mensagem) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"erro\":\"" + mensagem + "\"}");
    }
}
