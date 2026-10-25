package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoDTO {
    private Long ts;
    private String por;
    private String acao;
    private String detalhe;
}
