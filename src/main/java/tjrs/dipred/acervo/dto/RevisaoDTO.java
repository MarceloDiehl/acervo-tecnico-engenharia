package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/* uma linha por revisão (arquivo), no formato que a tela do acervo usa */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevisaoDTO {
    private Integer seq;
    private Integer rev;
    private String predio;
    private String disc;
    private String sis;
    private String tipo;
    private String fase;
    private String status;
    private String acesso;
    private String sigilo;
    private String ext;
    private Long size;
    private Long ts;   // inclusão, em milissegundos
    private String data;   // inclusão, dd/mm/aaaa
    private String por;
    private String url;   // endereço de download
    private String comentario;
    private String ticket;
    private String sei;
    private String hash;
    private ExclusaoDTO excluido;   // preenchido quando está na lixeira (só para o gestor)
}
