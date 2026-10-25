package tjrs.dipred.acervo.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/* listas de classificação usadas pelos formulários e filtros */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoDTO {
    private List<PredioDTO> predios;
    private List<DisciplinaDTO> disciplinas;
    private List<AssuntoDTO> assuntos;
    private List<TipoDocumentoDTO> tipos;
    private List<EtapaDTO> etapas;
}
