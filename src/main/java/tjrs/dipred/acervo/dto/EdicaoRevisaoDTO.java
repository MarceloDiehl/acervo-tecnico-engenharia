package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EdicaoRevisaoDTO {
    private String fase;
    private String status;
    private String acesso;
    private String sigilo;
    private String comentario;
    private String ticket;
    private String sei;
}
