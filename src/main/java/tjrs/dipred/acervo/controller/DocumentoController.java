package tjrs.dipred.acervo.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.NoSuchElementException;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import tjrs.dipred.acervo.dto.AcervoDTO;
import tjrs.dipred.acervo.dto.CorrecaoClassificacaoDTO;
import tjrs.dipred.acervo.dto.EdicaoRevisaoDTO;
import tjrs.dipred.acervo.dto.InclusaoDTO;
import tjrs.dipred.acervo.dto.InclusaoResultadoDTO;
import tjrs.dipred.acervo.dto.PedidoExclusaoDTO;
import tjrs.dipred.acervo.model.Revisao;
import tjrs.dipred.acervo.service.ArquivoService;
import tjrs.dipred.acervo.service.DocumentoService;

@RestController
@RequestMapping("/api")
public class DocumentoController {

    private final DocumentoService documentoService;
    private final ArquivoService arquivoService;

    public DocumentoController(DocumentoService documentoService, ArquivoService arquivoService) {
        this.documentoService = documentoService;
        this.arquivoService = arquivoService;
    }

    /* todas as revisões e o histórico de alterações (a tela filtra e pagina no navegador) */
    @GetMapping("/acervo")
    public ResponseEntity<AcervoDTO> consultar() {
        return ResponseEntity.ok(documentoService.consultar());
    }

    /* documento novo: multipart com o arquivo e os campos do formulário */
    @PostMapping("/documentos")
    public ResponseEntity<InclusaoResultadoDTO> incluirDocumento(@RequestParam("arquivo") MultipartFile arquivo,
                                                                 @ModelAttribute InclusaoDTO dados,
                                                                 Authentication authentication) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentoService.incluirDocumento(dados, arquivo, authentication.getName()));
    }

    /* nova revisão de um documento: mantém a classificação */
    @PostMapping("/documentos/{seq}/revisoes")
    public ResponseEntity<InclusaoResultadoDTO> incluirRevisao(@PathVariable Integer seq,
                                                               @RequestParam("arquivo") MultipartFile arquivo,
                                                               @ModelAttribute InclusaoDTO dados,
                                                               Authentication authentication) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentoService.incluirRevisao(seq, dados, arquivo, authentication.getName()));
    }

    @PutMapping("/documentos/{seq}/revisoes/{rev}")
    public ResponseEntity<Void> editarRevisao(@PathVariable Integer seq, @PathVariable Integer rev,
                                              @RequestBody EdicaoRevisaoDTO dados, Authentication authentication) {
        documentoService.editarRevisao(seq, rev, dados, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /* gestor */
    @PutMapping("/documentos/{seq}/classificacao")
    public ResponseEntity<Void> corrigirClassificacao(@PathVariable Integer seq, @RequestBody CorrecaoClassificacaoDTO dados,
                                                      Authentication authentication) throws IOException {
        documentoService.corrigirClassificacao(seq, dados, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /* gestor: manda o documento inteiro ou a última revisão para a lixeira */
    @PostMapping("/documentos/{seq}/exclusoes")
    public ResponseEntity<Void> excluir(@PathVariable Integer seq, @RequestBody PedidoExclusaoDTO dados,
                                        Authentication authentication) {
        documentoService.excluir(seq, dados, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/documentos/{seq}/revisoes/{rev}/arquivo")
    public ResponseEntity<Resource> baixar(@PathVariable Integer seq, @PathVariable Integer rev, Authentication authentication)
            throws IOException {
        Revisao r = documentoService.paraDownload(seq, rev, gestor(authentication));
        Path arquivo = arquivoService.caminho(r.getDiretorio(), r.getNomeArquivo());
        if (!Files.isRegularFile(arquivo)) {
            throw new NoSuchElementException("O arquivo " + r.getNomeArquivo() + " não foi encontrado na pasta do servidor.");
        }
        String tipo = Files.probeContentType(arquivo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(r.getNomeArquivo(), StandardCharsets.UTF_8).build().toString())
                .contentType(tipo != null ? MediaType.parseMediaType(tipo) : MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(Files.size(arquivo))
                .body(new FileSystemResource(arquivo));
    }

    static boolean gestor(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_GESTOR".equals(a.getAuthority()));
    }
}
