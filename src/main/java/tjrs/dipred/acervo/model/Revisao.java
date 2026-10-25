package tjrs.dipred.acervo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/* cada revisão tem exatamente um arquivo; o arquivo fica no disco, aqui só o caminho */
@Entity
@Table(name = "revisoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Revisao {

    public static final String EM_ELABORACAO = "Em elaboração";
    public static final String APROVADO = "Aprovado";
    public static final String SUBSTITUIDO = "Substituído";
    public static final String CANCELADO = "Cancelado";
    public static final String CLASSIFICADA = "Informação classificada";
    public static final String SEM_SIGILO = "Não se aplica";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_seq", nullable = false)
    private Documento documento;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false, length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etapa_codigo", nullable = false)
    private Etapa etapa;

    @Column(nullable = false, length = 30)
    private String acesso;

    @Column(nullable = false, length = 20)
    private String sigilo = SEM_SIGILO;

    @Column(length = 500)
    private String descricao;

    @Column(length = 24)
    private String ticket;

    @Column(length = 24)
    private String sei;

    @Column(nullable = false, length = 5)
    private String extensao;

    @Column(nullable = false)
    private Long tamanho;

    @Column(name = "hash_sha256", nullable = false, length = 64)
    private String hashSha256;

    @Column(name = "nome_original")
    private String nomeOriginal;

    /* nome gerado: PRÉDIO-DISC-SIS-TIPO-SEQ-Rnn.ext */
    @Column(name = "nome_arquivo", nullable = false, length = 120)
    private String nomeArquivo;

    /* relativo à raiz dos arquivos, ex.: acervo/POA-F-1/ELETRICA */
    @Column(nullable = false)
    private String diretorio;

    @Column(name = "incluido_por", nullable = false, length = 50)
    private String incluidoPor;

    @Column(name = "incluido_em", nullable = false)
    private LocalDateTime incluidoEm;

    /* preenchido quando a revisão está na lixeira */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exclusao_id")
    private Exclusao exclusao;
}
