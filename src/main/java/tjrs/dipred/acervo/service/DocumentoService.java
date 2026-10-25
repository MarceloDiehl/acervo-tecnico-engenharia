package tjrs.dipred.acervo.service;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import tjrs.dipred.acervo.dto.AcervoDTO;
import tjrs.dipred.acervo.dto.CorrecaoClassificacaoDTO;
import tjrs.dipred.acervo.dto.EdicaoRevisaoDTO;
import tjrs.dipred.acervo.dto.ExclusaoDTO;
import tjrs.dipred.acervo.dto.HistoricoDTO;
import tjrs.dipred.acervo.dto.InclusaoDTO;
import tjrs.dipred.acervo.dto.InclusaoResultadoDTO;
import tjrs.dipred.acervo.dto.PedidoExclusaoDTO;
import tjrs.dipred.acervo.dto.RevisaoDTO;
import tjrs.dipred.acervo.model.Assunto;
import tjrs.dipred.acervo.model.Documento;
import tjrs.dipred.acervo.model.Etapa;
import tjrs.dipred.acervo.model.Exclusao;
import tjrs.dipred.acervo.model.Historico;
import tjrs.dipred.acervo.model.Predio;
import tjrs.dipred.acervo.model.Revisao;
import tjrs.dipred.acervo.model.TipoDocumento;
import tjrs.dipred.acervo.repository.AssuntoRepository;
import tjrs.dipred.acervo.repository.DocumentoRepository;
import tjrs.dipred.acervo.repository.EtapaRepository;
import tjrs.dipred.acervo.repository.ExclusaoRepository;
import tjrs.dipred.acervo.repository.HistoricoRepository;
import tjrs.dipred.acervo.repository.PredioRepository;
import tjrs.dipred.acervo.repository.RevisaoRepository;
import tjrs.dipred.acervo.repository.TipoDocumentoRepository;

/*
 * Regras do acervo: inclusão de documentos e revisões, edição, correção de classificação,
 * lixeira e download. Os arquivos são gravados pelo ArquivoService; aqui só o caminho.
 *
 * Status: só uma revisão fica "Aprovado" (a vigente); ao aprovar uma revisão nova, as
 * anteriores aprovadas passam a "Substituído".
 */
@Service
public class DocumentoService {

    public static final List<String> EXTENSOES = List.of("pdf", "dwg", "dxf", "dwf", "rvt", "ifc", "skp", "doc", "docx",
            "xls", "xlsx", "jpg", "jpeg", "png", "tif", "tiff", "kmz", "zip");
    public static final List<String> STATUS_ESCOLHA = List.of(Revisao.EM_ELABORACAO, Revisao.APROVADO, Revisao.CANCELADO);
    public static final List<String> ACESSOS = List.of("Público", "Acesso controlado", Revisao.CLASSIFICADA);
    public static final List<String> SIGILOS = List.of("Reservada", "Secreta", "Ultrassecreta");

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final DocumentoRepository documentoRepository;
    private final RevisaoRepository revisaoRepository;
    private final ExclusaoRepository exclusaoRepository;
    private final HistoricoRepository historicoRepository;
    private final PredioRepository predioRepository;
    private final AssuntoRepository assuntoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final EtapaRepository etapaRepository;
    private final ArquivoService arquivoService;

    public DocumentoService(DocumentoRepository documentoRepository,
                            RevisaoRepository revisaoRepository,
                            ExclusaoRepository exclusaoRepository,
                            HistoricoRepository historicoRepository,
                            PredioRepository predioRepository,
                            AssuntoRepository assuntoRepository,
                            TipoDocumentoRepository tipoDocumentoRepository,
                            EtapaRepository etapaRepository,
                            ArquivoService arquivoService) {
        this.documentoRepository = documentoRepository;
        this.revisaoRepository = revisaoRepository;
        this.exclusaoRepository = exclusaoRepository;
        this.historicoRepository = historicoRepository;
        this.predioRepository = predioRepository;
        this.assuntoRepository = assuntoRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.etapaRepository = etapaRepository;
        this.arquivoService = arquivoService;
    }

    /* ---------- consulta ---------- */

    @Transactional(readOnly = true)
    public AcervoDTO consultar() {
        List<RevisaoDTO> docs = revisaoRepository.listarTodas().stream().map(this::paraDTO).toList();
        Map<Integer, List<HistoricoDTO>> hist = new LinkedHashMap<>();
        for (Historico h : historicoRepository.listarTodos()) {
            hist.computeIfAbsent(h.getDocumento().getSeq(), k -> new ArrayList<>())
                    .add(new HistoricoDTO(ms(h.getQuando()), h.getUsuario(), h.getAcao(), h.getDetalhe()));
        }
        return new AcervoDTO(docs, hist, documentoRepository.maiorSeq() + 1);
    }

    /* ---------- inclusão ---------- */

    @Transactional
    public InclusaoResultadoDTO incluirDocumento(InclusaoDTO dados, MultipartFile arquivo, String usuario) throws IOException {
        Predio predio = predio(dados.getPredio());
        Assunto assunto = assunto(dados.getDisc(), dados.getSis());
        TipoDocumento tipo = tipo(dados.getTipo());
        Revisao r = novaRevisao(dados, tipo, arquivo, usuario);
        r.setNumero(0);
        r.setSei(vazioNulo(texto(dados.getSei(), "[^0-9./-]", 24)));

        Documento d = new Documento(null, predio, assunto, tipo, r.getIncluidoEm(), usuario);
        documentoRepository.save(d);
        return gravar(d, r, arquivo, List.of());
    }

    @Transactional
    public InclusaoResultadoDTO incluirRevisao(Integer seq, InclusaoDTO dados, MultipartFile arquivo, String usuario) throws IOException {
        Documento d = documento(seq);
        List<Revisao> todas = revisaoRepository.doDocumento(seq);
        List<Revisao> vivas = vivas(todas);
        if (vivas.isEmpty()) {
            throw new IllegalStateException("O documento " + pad(seq) + " está na lixeira.");
        }
        Revisao r = novaRevisao(dados, d.getTipo(), arquivo, usuario);
        /* o número da revisão nunca é reaproveitado, nem o de uma revisão na lixeira */
        r.setNumero(todas.stream().mapToInt(Revisao::getNumero).max().orElse(-1) + 1);
        r.setSei(ultima(vivas).getSei());
        return gravar(d, r, arquivo, vivas);
    }

    private Revisao novaRevisao(InclusaoDTO dados, TipoDocumento tipo, MultipartFile arquivo, String usuario) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Escolha o arquivo que será incluído.");
        }
        Revisao r = new Revisao();
        r.setExtensao(extensao(arquivo.getOriginalFilename()));
        r.setNomeOriginal(texto(arquivo.getOriginalFilename(), null, 255));
        r.setEtapa(etapa(tipo, dados.getFase()));
        r.setStatus(escolha(dados.getStatus(), STATUS_ESCOLHA, "o status"));
        r.setAcesso(escolha(dados.getAcesso(), ACESSOS, "o acesso"));
        r.setSigilo(sigilo(r.getAcesso(), dados.getSigilo()));
        r.setDescricao(vazioNulo(texto(dados.getComentario(), null, 500)));
        r.setTicket(vazioNulo(texto(dados.getTicket(), "[^0-9A-Za-z./-]", 24)));
        r.setIncluidoPor(usuario);
        r.setIncluidoEm(LocalDateTime.now());
        return r;
    }

    /* grava a revisão no banco e move o arquivo da pasta temporária para a pasta do acervo */
    private InclusaoResultadoDTO gravar(Documento d, Revisao r, MultipartFile arquivo, List<Revisao> vivas) throws IOException {
        r.setDocumento(d);
        r.setDiretorio(arquivoService.diretorio(d.getPredio(), d.getAssunto().getDisciplina()));
        r.setNomeArquivo(nomeArquivo(d, r.getNumero(), r.getExtensao()));
        if (Revisao.APROVADO.equals(r.getStatus())) {
            vivas.stream().filter(v -> Revisao.APROVADO.equals(v.getStatus())).forEach(v -> v.setStatus(Revisao.SUBSTITUIDO));
        }
        ArquivoService.Recebido recebido = arquivoService.receber(arquivo);
        try {
            r.setHashSha256(recebido.hash());
            r.setTamanho(recebido.tamanho());
            revisaoRepository.saveAndFlush(r);
            Path destino = arquivoService.guardar(recebido.temporario(), r.getDiretorio(), r.getNomeArquivo());
            aoDesfazer(() -> arquivoService.descartar(destino));
        } catch (RuntimeException | IOException e) {
            arquivoService.descartar(recebido.temporario());
            throw e;
        }
        return new InclusaoResultadoDTO(d.getSeq(), r.getNumero(), r.getNomeArquivo());
    }

    /* ---------- edição das informações de uma revisão ---------- */

    @Transactional
    public void editarRevisao(Integer seq, Integer numero, EdicaoRevisaoDTO dados, String usuario) {
        Documento d = documento(seq);
        List<Revisao> vivas = vivas(revisaoRepository.doDocumento(seq));
        Revisao r = vivas.stream().filter(x -> x.getNumero().equals(numero)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("Revisão " + revTxt(numero) + " não encontrada."));

        Etapa etapa = etapa(d.getTipo(), dados.getFase());
        /* "Substituído" não é escolhido na tela, mas pode continuar como está */
        String status = r.getStatus().equals(dados.getStatus()) ? r.getStatus() : escolha(dados.getStatus(), STATUS_ESCOLHA, "o status");
        String acesso = escolha(dados.getAcesso(), ACESSOS, "o acesso");
        String sigilo = sigilo(acesso, dados.getSigilo());
        String descricao = texto(dados.getComentario(), null, 500);
        String ticket = texto(dados.getTicket(), "[^0-9A-Za-z./-]", 24);
        String sei = texto(dados.getSei(), "[^0-9./-]", 24);

        List<String> mud = new ArrayList<>();
        if (!sei.equals(nvl(r.getSei()))) mud.add("Processo SEI: " + traco(r.getSei()) + " → " + traco(sei));
        if (!ticket.equals(nvl(r.getTicket()))) mud.add("Número do ticket: " + traco(r.getTicket()) + " → " + traco(ticket));
        if (!status.equals(r.getStatus())) mud.add("Status: " + r.getStatus() + " → " + status);
        if (!etapa.getCodigo().equals(r.getEtapa().getCodigo())) mud.add("Etapa: " + r.getEtapa().getNome() + " → " + etapa.getNome());
        if (!acesso.equals(r.getAcesso())) mud.add("Acesso: " + r.getAcesso() + " → " + acesso);
        if (!sigilo.equals(r.getSigilo()) && Revisao.CLASSIFICADA.equals(acesso)) mud.add("Sigilo: " + sigilo);
        if (!descricao.equals(nvl(r.getDescricao()))) mud.add("Descrição atualizada");
        if (mud.isEmpty()) {
            return;
        }
        if (Revisao.APROVADO.equals(status) && !Revisao.APROVADO.equals(r.getStatus())) {
            List<Revisao> subst = vivas.stream()
                    .filter(x -> x.getNumero() < numero && Revisao.APROVADO.equals(x.getStatus())).toList();
            subst.forEach(x -> x.setStatus(Revisao.SUBSTITUIDO));
            if (!subst.isEmpty()) {
                mud.add(subst.stream().map(x -> revTxt(x.getNumero())).collect(Collectors.joining(", ")) + " passou a Substituído");
            }
        }
        r.setEtapa(etapa);
        r.setStatus(status);
        r.setAcesso(acesso);
        r.setSigilo(sigilo);
        r.setDescricao(vazioNulo(descricao));
        r.setTicket(vazioNulo(ticket));
        r.setSei(vazioNulo(sei));
        registrar(d, usuario, "Informações da " + revTxt(numero) + " editadas", String.join("\n", mud));
    }

    /* ---------- correção de classificação (gestor): renomeia e move todos os arquivos ---------- */

    @Transactional
    public void corrigirClassificacao(Integer seq, CorrecaoClassificacaoDTO dados, String usuario) throws IOException {
        Documento d = documento(seq);
        Predio predio = predio(dados.getPredio());
        Assunto assunto = assunto(dados.getDisc(), dados.getSis());
        TipoDocumento tipo = tipo(dados.getTipo());
        String justificativa = texto(dados.getJustificativa(), null, 300);
        if (justificativa.length() < 10) {
            throw new IllegalArgumentException("Escreva uma justificativa com pelo menos 10 caracteres.");
        }

        List<String> mud = new ArrayList<>();
        if (!predio.getCodigo().equals(d.getPredio().getCodigo())) mud.add("Prédio: " + d.getPredio().getNome() + " → " + predio.getNome());
        if (!assunto.getId().equals(d.getAssunto().getId())) mud.add("Assunto: " + d.getAssunto().getNome() + " → " + assunto.getNome());
        if (!assunto.getDisciplina().getCodigo().equals(d.getAssunto().getDisciplina().getCodigo())) {
            mud.add("Disciplina: " + d.getAssunto().getDisciplina().getNome() + " → " + assunto.getDisciplina().getNome());
        }
        boolean trocouTipo = !tipo.getCodigo().equals(d.getTipo().getCodigo());
        if (trocouTipo) mud.add("Tipo: " + d.getTipo().getNome() + " → " + tipo.getNome());
        if (mud.isEmpty()) {
            throw new IllegalArgumentException("A classificação é a mesma. Nada a corrigir.");
        }

        d.setPredio(predio);
        d.setAssunto(assunto);
        d.setTipo(tipo);
        Etapa etapaFixa = trocouTipo && tipo.getEtapaFixa() != null ? etapa(tipo, null) : null;
        String novoDiretorio = arquivoService.diretorio(predio, assunto.getDisciplina());

        /* move os arquivos; se algo falhar (aqui ou no banco), desfaz o que já foi movido */
        List<String[]> movidos = new ArrayList<>();
        try {
            for (Revisao r : revisaoRepository.doDocumento(seq)) {
                String novoNome = nomeArquivo(d, r.getNumero(), r.getExtensao());
                if (arquivoService.mover(r.getDiretorio(), r.getNomeArquivo(), novoDiretorio, novoNome)) {
                    movidos.add(new String[] { novoDiretorio, novoNome, r.getDiretorio(), r.getNomeArquivo() });
                }
                r.setDiretorio(novoDiretorio);
                r.setNomeArquivo(novoNome);
                if (etapaFixa != null) {
                    r.setEtapa(etapaFixa);
                }
            }
        } catch (RuntimeException | IOException e) {
            desfazerMovimentos(movidos);
            throw e;
        }
        aoDesfazer(() -> desfazerMovimentos(movidos));

        mud.add("Justificativa: " + justificativa);
        registrar(d, usuario, "Classificação corrigida e arquivos renomeados", String.join("\n", mud));
    }

    private void desfazerMovimentos(List<String[]> movidos) {
        for (int i = movidos.size() - 1; i >= 0; i--) {
            String[] m = movidos.get(i);
            try {
                arquivoService.mover(m[0], m[1], m[2], m[3]);
            } catch (IOException | RuntimeException ignorado) {
                // segue desfazendo os demais
            }
        }
    }

    /* ---------- lixeira (gestor) ---------- */

    @Transactional
    public void excluir(Integer seq, PedidoExclusaoDTO dados, String usuario) {
        Documento d = documento(seq);
        String motivo = texto(dados.getMotivo(), null, 300);
        if (motivo.length() < 10) {
            throw new IllegalArgumentException("Escreva o motivo da exclusão com pelo menos 10 caracteres.");
        }
        List<Revisao> vivas = vivas(revisaoRepository.doDocumento(seq));
        if (vivas.isEmpty()) {
            throw new IllegalStateException("O documento " + pad(seq) + " já está na lixeira.");
        }
        boolean soRevisao = "rev".equals(dados.getAlvo());
        if (soRevisao && vivas.size() < 2) {
            throw new IllegalArgumentException("O documento tem uma só revisão: exclua o documento inteiro.");
        }
        Revisao ultima = ultima(vivas);
        Exclusao exclusao = new Exclusao(null, d, soRevisao ? Exclusao.REVISAO : Exclusao.DOCUMENTO, ultima.getNumero(),
                motivo, usuario, LocalDateTime.now(), null, null);
        exclusaoRepository.save(exclusao);

        if (soRevisao) {
            ultima.setExclusao(exclusao);
            ajustarVigente(vivas.stream().filter(r -> r != ultima).toList());
        } else {
            vivas.forEach(r -> r.setExclusao(exclusao));
        }
        registrar(d, usuario, soRevisao ? "Revisão " + revTxt(ultima.getNumero()) + " excluída" : "Documento excluído",
                "Justificativa: " + motivo);
    }

    /* se nenhuma revisão restante está aprovada, a última substituída volta a valer */
    private void ajustarVigente(List<Revisao> vivas) {
        if (vivas.stream().anyMatch(r -> Revisao.APROVADO.equals(r.getStatus()))) {
            return;
        }
        vivas.stream().filter(r -> Revisao.SUBSTITUIDO.equals(r.getStatus()))
                .max(Comparator.comparing(Revisao::getNumero))
                .ifPresent(r -> r.setStatus(Revisao.APROVADO));
    }

    @Transactional
    public void restaurar(Integer exclusaoId, String usuario) {
        Exclusao exclusao = exclusaoRepository.findById(exclusaoId)
                .orElseThrow(() -> new NoSuchElementException("Item da lixeira não encontrado."));
        if (exclusao.getRestauradoEm() != null) {
            throw new IllegalStateException("Este item já foi restaurado.");
        }
        List<Revisao> alvo = revisaoRepository.findByExclusao(exclusao);
        alvo.forEach(r -> r.setExclusao(null));
        Documento d = exclusao.getDocumento();
        Integer numero = exclusao.getRevisaoNumero();

        /* revisão aprovada que volta: se já há uma aprovada mais nova, ela fica como substituída */
        if (Exclusao.REVISAO.equals(exclusao.getAlvo()) && alvo.stream().anyMatch(r -> Revisao.APROVADO.equals(r.getStatus()))) {
            List<Revisao> vivas = vivas(revisaoRepository.doDocumento(d.getSeq()));
            boolean haMaisNova = vivas.stream().anyMatch(r -> Revisao.APROVADO.equals(r.getStatus()) && r.getNumero() > numero);
            for (Revisao r : vivas) {
                if (haMaisNova && r.getNumero().equals(numero)) {
                    r.setStatus(Revisao.SUBSTITUIDO);
                } else if (!haMaisNova && r.getNumero() < numero && Revisao.APROVADO.equals(r.getStatus())) {
                    r.setStatus(Revisao.SUBSTITUIDO);
                }
            }
        }
        exclusao.setRestauradoPor(usuario);
        exclusao.setRestauradoEm(LocalDateTime.now());
        registrar(d, usuario, Exclusao.DOCUMENTO.equals(exclusao.getAlvo())
                ? "Documento restaurado da lixeira" : "Revisão " + revTxt(numero) + " restaurada da lixeira", "");
    }

    /* ---------- download ---------- */

    @Transactional(readOnly = true)
    public Revisao paraDownload(Integer seq, Integer numero, boolean gestor) {
        Revisao r = revisaoRepository.doDocumento(seq).stream().filter(x -> x.getNumero().equals(numero)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("Revisão não encontrada."));
        if (r.getExclusao() != null && !gestor) {
            throw new NoSuchElementException("Revisão não encontrada.");
        }
        if (Revisao.CLASSIFICADA.equals(r.getAcesso()) && !gestor) {
            throw new AccessDeniedException("Documento sigiloso: solicite acesso ao gestor do acervo técnico do DIPRED-DMAN.");
        }
        return r;
    }

    /* ---------- apoio ---------- */

    /* PRÉDIO-DISC-SIS-TIPO-SEQ, ex.: POA-F-1-ELE-ILU-PRA-00007 */
    public static String base(Documento d) {
        return String.join("-", d.getPredio().getCodigo(), d.getAssunto().getDisciplina().getCodigo(),
                d.getAssunto().getCodigo(), d.getTipo().getCodigo(), pad(d.getSeq()));
    }

    public static String nomeArquivo(Documento d, Integer numero, String extensao) {
        return base(d) + "-" + revTxt(numero) + "." + extensao;
    }

    public static String pad(Integer seq) {
        return String.format("%05d", seq);
    }

    public static String revTxt(Integer numero) {
        return String.format("R%02d", numero);
    }

    private RevisaoDTO paraDTO(Revisao r) {
        Documento d = r.getDocumento();
        Exclusao e = r.getExclusao();
        ExclusaoDTO excluido = e == null ? null : new ExclusaoDTO(e.getId(), ms(e.getExcluidoEm()), e.getExcluidoPor(),
                e.getMotivo(), Exclusao.DOCUMENTO.equals(e.getAlvo()) ? "doc" : "rev", e.getRevisaoNumero());
        return new RevisaoDTO(d.getSeq(), r.getNumero(), d.getPredio().getCodigo(), d.getAssunto().getDisciplina().getCodigo(),
                d.getAssunto().getCodigo(), d.getTipo().getCodigo(), r.getEtapa().getCodigo(), r.getStatus(), r.getAcesso(),
                r.getSigilo(), r.getExtensao(), r.getTamanho(), ms(r.getIncluidoEm()), r.getIncluidoEm().format(DATA),
                r.getIncluidoPor(), "/api/documentos/" + d.getSeq() + "/revisoes/" + r.getNumero() + "/arquivo",
                nvl(r.getDescricao()), nvl(r.getTicket()), nvl(r.getSei()), r.getHashSha256(), excluido);
    }

    private Documento documento(Integer seq) {
        return documentoRepository.buscar(seq)
                .orElseThrow(() -> new NoSuchElementException("Documento " + pad(seq) + " não encontrado."));
    }

    private Predio predio(String codigo) {
        return predioRepository.findById(nvl(codigo))
                .orElseThrow(() -> new IllegalArgumentException("Escolha o prédio."));
    }

    private Assunto assunto(String disciplina, String codigo) {
        return assuntoRepository.buscar(nvl(disciplina), nvl(codigo))
                .orElseThrow(() -> new IllegalArgumentException("Escolha a disciplina e o assunto."));
    }

    private TipoDocumento tipo(String codigo) {
        return tipoDocumentoRepository.findById(nvl(codigo))
                .orElseThrow(() -> new IllegalArgumentException("Escolha o tipo de documento."));
    }

    /* a etapa vem do tipo, quando ele define uma (Execução, Manutenção e inspeção, Administrativo) */
    private Etapa etapa(TipoDocumento tipo, String codigo) {
        String c = tipo.getEtapaFixa() != null ? tipo.getEtapaFixa() : nvl(codigo);
        return etapaRepository.findById(c).orElseThrow(() -> new IllegalArgumentException("Escolha a etapa."));
    }

    private String sigilo(String acesso, String sigilo) {
        return Revisao.CLASSIFICADA.equals(acesso) ? escolha(sigilo, SIGILOS, "o grau de sigilo") : Revisao.SEM_SIGILO;
    }

    private static String escolha(String valor, List<String> opcoes, String campo) {
        if (valor == null || !opcoes.contains(valor)) {
            throw new IllegalArgumentException("Escolha " + campo + ".");
        }
        return valor;
    }

    private static String extensao(String nome) {
        String n = nvl(nome);
        String ext = n.contains(".") ? n.substring(n.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!EXTENSOES.contains(ext)) {
            throw new IllegalArgumentException("Este formato não é aceito. Use PDF, DWG, DXF, DWF, RVT, IFC, SKP, DOC(X), XLS(X), JPG, PNG, TIF, KMZ ou ZIP.");
        }
        return "jpeg".equals(ext) ? "jpg" : ext;
    }

    /* texto aparado, sem os caracteres proibidos e dentro do limite */
    private static String texto(String valor, String proibidos, int limite) {
        String t = nvl(valor).trim();
        if (proibidos != null) {
            t = t.replaceAll(proibidos, "");
        }
        if (t.length() > limite) {
            throw new IllegalArgumentException("Texto acima de " + limite + " caracteres.");
        }
        return t;
    }

    private static List<Revisao> vivas(List<Revisao> revisoes) {
        return revisoes.stream().filter(r -> r.getExclusao() == null).toList();
    }

    private static Revisao ultima(List<Revisao> revisoes) {
        return revisoes.stream().max(Comparator.comparing(Revisao::getNumero)).orElseThrow();
    }

    private void registrar(Documento d, String usuario, String acao, String detalhe) {
        historicoRepository.save(new Historico(null, d, LocalDateTime.now(), usuario, acao, detalhe));
    }

    /* executa a ação se a transação for desfeita (ex.: apagar o arquivo já movido) */
    private static void aoDesfazer(Runnable acao) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    acao.run();
                }
            }
        });
    }

    private static long ms(LocalDateTime t) {
        return t.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    private static String nvl(String s) {
        return s == null ? "" : s;
    }

    private static String vazioNulo(String s) {
        return s == null || s.isEmpty() ? null : s;
    }

    private static String traco(String s) {
        return s == null || s.isEmpty() ? "—" : s;
    }
}
