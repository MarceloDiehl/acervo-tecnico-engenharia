package tjrs.dipred.acervo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "assuntos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assunto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_codigo", nullable = false)
    private Disciplina disciplina;

    @Column(nullable = false, length = 6)
    private String codigo;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(length = 200)
    private String dica;

    @Column(nullable = false)
    private Integer ordem;
}
