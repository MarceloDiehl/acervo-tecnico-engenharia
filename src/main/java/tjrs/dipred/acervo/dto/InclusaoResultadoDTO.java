package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InclusaoResultadoDTO {
    private Integer seq;
    private Integer rev;
    private String nomeArquivo;
}
