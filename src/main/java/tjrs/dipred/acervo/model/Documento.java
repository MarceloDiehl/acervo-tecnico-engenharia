package tjrs.dipred.acervo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/* a classificação (prédio, assunto/disciplina e tipo) vale para todas as revisões */
@Entity
@Table(name = "documentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer seq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "predio_codigo", nullable = false)
    private Predio predio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assunto_id", nullable = false)
    private Assunto assunto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_codigo", nullable = false)
    private TipoDocumento tipo;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "criado_por", nullable = false, length = 50)
    private String criadoPor;
}
