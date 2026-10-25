package tjrs.dipred.acervo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tjrs.dipred.acervo.dto.AssuntoDTO;
import tjrs.dipred.acervo.dto.CatalogoDTO;
import tjrs.dipred.acervo.dto.DisciplinaDTO;
import tjrs.dipred.acervo.dto.EtapaDTO;
import tjrs.dipred.acervo.dto.PredioDTO;
import tjrs.dipred.acervo.dto.TipoDocumentoDTO;
import tjrs.dipred.acervo.repository.AssuntoRepository;
import tjrs.dipred.acervo.repository.DisciplinaRepository;
import tjrs.dipred.acervo.repository.EtapaRepository;
import tjrs.dipred.acervo.repository.PredioRepository;
import tjrs.dipred.acervo.repository.TipoDocumentoRepository;

@Service
public class CatalogoService {

    private final PredioRepository predioRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final AssuntoRepository assuntoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final EtapaRepository etapaRepository;

    public CatalogoService(PredioRepository predioRepository,
                           DisciplinaRepository disciplinaRepository,
                           AssuntoRepository assuntoRepository,
                           TipoDocumentoRepository tipoDocumentoRepository,
                           EtapaRepository etapaRepository) {
        this.predioRepository = predioRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.assuntoRepository = assuntoRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.etapaRepository = etapaRepository;
    }

    @Transactional(readOnly = true)
    public CatalogoDTO listar() {
        return new CatalogoDTO(
                predioRepository.findAllByOrderByNomeAsc().stream()
                        .map(p -> new PredioDTO(p.getCodigo(), p.getNome(), p.getImovel())).toList(),
                disciplinaRepository.findAllByOrderByOrdemAsc().stream()
                        .map(d -> new DisciplinaDTO(d.getCodigo(), d.getNome())).toList(),
                assuntoRepository.listarTodos().stream()
                        .map(a -> new AssuntoDTO(a.getDisciplina().getCodigo(), a.getCodigo(), a.getNome(), a.getDica())).toList(),
                tipoDocumentoRepository.findAllByOrderByOrdemAsc().stream()
                        .map(t -> new TipoDocumentoDTO(t.getCodigo(), t.getNome(), t.getNatureza(), t.getRegistro(), t.getEtapaFixa())).toList(),
                etapaRepository.findAllByOrderByOrdemAsc().stream()
                        .map(e -> new EtapaDTO(e.getCodigo(), e.getNome())).toList());
    }
}
