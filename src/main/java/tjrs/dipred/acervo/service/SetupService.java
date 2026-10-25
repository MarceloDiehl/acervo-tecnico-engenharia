package tjrs.dipred.acervo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import tjrs.dipred.acervo.model.Usuario;
import tjrs.dipred.acervo.repository.DisciplinaRepository;
import tjrs.dipred.acervo.repository.PredioRepository;
import tjrs.dipred.acervo.repository.UsuarioRepository;

@Service
public class SetupService implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PredioRepository predioRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final ArquivoService arquivoService;
    private final PasswordEncoder passwordEncoder;
    private final String senhaInicialAdmin;

    public SetupService(UsuarioRepository usuarioRepository,
                        PredioRepository predioRepository,
                        DisciplinaRepository disciplinaRepository,
                        ArquivoService arquivoService,
                        PasswordEncoder passwordEncoder,
                        @Value("${acervo.admin.senha-inicial:}") String senhaInicialAdmin) {
        this.usuarioRepository = usuarioRepository;
        this.predioRepository = predioRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.arquivoService = arquivoService;
        this.passwordEncoder = passwordEncoder;
        this.senhaInicialAdmin = senhaInicialAdmin;
    }

    @Override
    public void run(String... args) throws Exception {
        /* confere a estrutura de pastas (cria as que faltarem, ex.: prédio novo no banco) */
        int criadas = arquivoService.prepararEstrutura(predioRepository.findAll(), disciplinaRepository.findAll());
        System.out.println(">>> Pastas do acervo em " + arquivoService.getRaiz() + (criadas > 0 ? " (" + criadas + " criadas)" : ""));

        /* primeiro gestor, quando ainda não há nenhum usuário */
        if (usuarioRepository.count() == 0 && !senhaInicialAdmin.isBlank()) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setNomeCompleto("Gestor do acervo");
            admin.setPassword(passwordEncoder.encode(senhaInicialAdmin));
            admin.setPerfil(Usuario.GESTOR);
            admin.setAtivo(true);
            usuarioRepository.save(admin);
            System.out.println(">>> Usuário GESTOR 'admin' criado com senha criptografada!");
        }
    }
}
