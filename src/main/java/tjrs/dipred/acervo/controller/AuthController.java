package tjrs.dipred.acervo.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tjrs.dipred.acervo.dto.UsuarioLogadoDTO;
import tjrs.dipred.acervo.model.Usuario;
import tjrs.dipred.acervo.repository.UsuarioRepository;

/* confere usuário e senha; depois o front manda as credenciais em HTTP Basic em cada chamada */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.getOrDefault("usuario", "").trim();
        String password = loginData.getOrDefault("senha", "");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (Boolean.TRUE.equals(usuario.getAtivo()) && passwordEncoder.matches(password, usuario.getPassword())) {
                return ResponseEntity.ok(new UsuarioLogadoDTO(usuario.getUsername(), usuario.getNomeCompleto(),
                        usuario.getPerfil().toLowerCase()));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", "Usuário ou senha inválidos."));
    }
}
