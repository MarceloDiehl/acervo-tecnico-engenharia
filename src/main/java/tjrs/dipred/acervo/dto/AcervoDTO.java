package tjrs.dipred.acervo.dto;

import java.util.List;
import java.util.Map;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcervoDTO {
    private List<RevisaoDTO> docs;
    private Map<Integer, List<HistoricoDTO>> hist;   // por número sequencial
    private Integer proximoSeq;
}
