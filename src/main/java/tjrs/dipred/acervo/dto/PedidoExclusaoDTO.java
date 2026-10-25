package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoExclusaoDTO {
    private String alvo;   // doc ou rev
    private String motivo;
}
