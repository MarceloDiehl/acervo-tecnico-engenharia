package tjrs.dipred.acervo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioLogadoDTO {
    private String usuario;
    private String nome;
    private String perfil;   // tecnico ou gestor
}
