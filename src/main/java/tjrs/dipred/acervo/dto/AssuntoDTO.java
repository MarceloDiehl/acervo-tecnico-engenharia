package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssuntoDTO {
    private String disciplina;
    private String codigo;
    private String nome;
    private String dica;
}
