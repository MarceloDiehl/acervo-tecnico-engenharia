package tjrs.dipred.acervo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "exclusoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exclusao {

    public static final String DOCUMENTO = "DOCUMENTO";
    public static final String REVISAO = "REVISAO";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_seq", nullable = false)
    private Documento documento;

    /* DOCUMENTO ou REVISAO */
    @Column(nullable = false, length = 10)
    private String alvo;

    @Column(name = "revisao_numero", nullable = false)
    private Integer revisaoNumero;

    @Column(nullable = false, length = 300)
    private String motivo;

    @Column(name = "excluido_por", nullable = false, length = 50)
    private String excluidoPor;

    @Column(name = "excluido_em", nullable = false)
    private LocalDateTime excluidoEm;

    @Column(name = "restaurado_por", length = 50)
    private String restauradoPor;

    @Column(name = "restaurado_em")
    private LocalDateTime restauradoEm;
}
