package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExclusaoDTO {
    private Integer id;
    private Long ts;
    private String por;
    private String motivo;
    private String alvo;   // doc ou rev
    private Integer rev;
}
