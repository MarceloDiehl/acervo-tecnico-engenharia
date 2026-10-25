package tjrs.dipred.acervo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/* alterações registradas: edição, correção de classificação, exclusão e restauração */
@Entity
@Table(name = "historico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Historico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_seq", nullable = false)
    private Documento documento;

    @Column(nullable = false)
    private LocalDateTime quando;

    @Column(nullable = false, length = 50)
    private String usuario;

    @Column(nullable = false, length = 150)
    private String acao;

    @Column(columnDefinition = "TEXT")
    private String detalhe;
}
