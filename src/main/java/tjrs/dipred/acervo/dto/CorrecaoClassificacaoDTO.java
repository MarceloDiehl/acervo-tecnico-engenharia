package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CorrecaoClassificacaoDTO {
    private String predio;
    private String disc;
    private String sis;
    private String tipo;
    private String justificativa;
}
