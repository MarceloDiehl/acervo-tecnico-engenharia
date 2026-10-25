package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/* campos do formulário de inclusão (documento novo ou nova revisão) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InclusaoDTO {
    private String predio;
    private String disc;
    private String sis;
    private String tipo;
    private String fase;
    private String status;
    private String acesso;
    private String sigilo;
    private String comentario;
    private String ticket;
    private String sei;
}
