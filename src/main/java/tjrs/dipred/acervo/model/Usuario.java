package tjrs.dipred.acervo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    public static final String TECNICO = "TECNICO";
    public static final String GESTOR = "GESTOR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "nome_completo", length = 100)
    private String nomeCompleto;

    /* TECNICO ou GESTOR */
    @Column(nullable = false, length = 10)
    private String perfil = TECNICO;

    @Column(nullable = false)
    private Boolean ativo = true;
}
