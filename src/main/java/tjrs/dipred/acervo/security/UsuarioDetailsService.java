package tjrs.dipred.acervo.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import tjrs.dipred.acervo.model.Usuario;
import tjrs.dipred.acervo.repository.UsuarioRepository;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        /* perfil TECNICO ou GESTOR vira o papel ROLE_TECNICO ou ROLE_GESTOR */
        return User.withUsername(usuario.getUsername())
                .password(usuario.getPassword())
                .roles(usuario.getPerfil())
                .disabled(!Boolean.TRUE.equals(usuario.getAtivo()))
                .build();
    }
}
