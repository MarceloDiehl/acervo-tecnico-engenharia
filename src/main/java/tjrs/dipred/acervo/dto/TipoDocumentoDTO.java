package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoDocumentoDTO {
    private String codigo;
    private String nome;
    private String natureza;
    private Boolean registro;
    private String etapaFixa;
}
