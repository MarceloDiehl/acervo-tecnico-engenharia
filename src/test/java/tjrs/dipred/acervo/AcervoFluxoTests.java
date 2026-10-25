package tjrs.dipred.acervo;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import com.jayway.jsonpath.JsonPath;

import tjrs.dipred.acervo.model.Assunto;
import tjrs.dipred.acervo.model.Disciplina;
import tjrs.dipred.acervo.model.Etapa;
import tjrs.dipred.acervo.model.Predio;
import tjrs.dipred.acervo.model.TipoDocumento;
import tjrs.dipred.acervo.model.Usuario;
import tjrs.dipred.acervo.repository.AssuntoRepository;
import tjrs.dipred.acervo.repository.DisciplinaRepository;
import tjrs.dipred.acervo.repository.EtapaRepository;
import tjrs.dipred.acervo.repository.PredioRepository;
import tjrs.dipred.acervo.repository.TipoDocumentoRepository;
import tjrs.dipred.acervo.repository.UsuarioRepository;
import tjrs.dipred.acervo.service.ArquivoService;

/* percorre o CRUD pela API, com banco H2 e gravando os arquivos numa pasta de teste */
@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AcervoFluxoTests {

    @Autowired MockMvc mvc;
    @Autowired ArquivoService arquivoService;
    @Autowired EtapaRepository etapaRepository;
    @Autowired DisciplinaRepository disciplinaRepository;
    @Autowired AssuntoRepository assuntoRepository;
    @Autowired TipoDocumentoRepository tipoDocumentoRepository;
    @Autowired PredioRepository predioRepository;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeAll
    void carregarCatalogos() throws IOException {
        Path raiz = arquivoService.getRaiz();
        if (Files.exists(raiz)) {
            try (Stream<Path> s = Files.walk(raiz)) {
                s.sorted(Comparator.reverseOrder()).forEach(p -> p.toFile().delete());
            }
        }
        etapaRepository.save(new Etapa("EXE", "Projeto Executivo", 1));
        etapaRepository.save(new Etapa("OBR", "Obra", 2));
        Disciplina ele = disciplinaRepository.save(new Disciplina("ELE", "Elétrica", "ELETRICA", 1));
        Disciplina civ = disciplinaRepository.save(new Disciplina("CIV", "Civil", "CIVIL", 2));
        assuntoRepository.save(new Assunto(null, ele, "ILU", "Iluminação e tomadas", null, 1));
        assuntoRepository.save(new Assunto(null, civ, "OBR", "Obras civis", null, 1));
        tipoDocumentoRepository.save(new TipoDocumento("PRA", "Prancha", "Projeto", false, null, 1));
        tipoDocumentoRepository.save(new TipoDocumento("RDO", "Relatório diário de obra", "Execução", true, "OBR", 2));
        predioRepository.save(new Predio("POA-F-1", "Porto Alegre - Foro Central - Prédio 1", "IMV-0126"));
        predioRepository.save(new Predio("PEL-F-1", "Pelotas", "IMV-0108"));
        usuarioRepository.save(new Usuario(null, "tecnico", passwordEncoder.encode("senha1"), "Técnico", Usuario.TECNICO, true));
        usuarioRepository.save(new Usuario(null, "gestor", passwordEncoder.encode("senha2"), "Gestor", Usuario.GESTOR, true));
    }

    private MockMultipartHttpServletRequestBuilder inclusao(String url, String nomeArquivo, String conteudo) {
        MockMultipartHttpServletRequestBuilder b = multipart(url);
        b.file(new MockMultipartFile("arquivo", nomeArquivo, "application/octet-stream", conteudo.getBytes(StandardCharsets.UTF_8)));
        return b;
    }

    private Object ler(String json, String caminho) {
        return JsonPath.read(json, caminho);
    }

    private String acervo() throws Exception {
        return mvc.perform(get("/api/acervo")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
    }

    @Test
    void fluxoCompleto() throws Exception {
        /* catálogos e login */
        mvc.perform(get("/api/catalogos")).andExpect(status().isOk()).andExpect(jsonPath("$.predios", hasSize(2)));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"usuario\":\"gestor\",\"senha\":\"senha2\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.perfil").value("gestor"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"usuario\":\"gestor\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized());

        /* incluir exige login */
        mvc.perform(inclusao("/api/documentos", "planta.pdf", "r0").param("predio", "POA-F-1"))
                .andExpect(status().isUnauthorized());

        /* formato não aceito */
        mvc.perform(inclusao("/api/documentos", "virus.exe", "x").param("predio", "POA-F-1").param("disc", "ELE").param("sis", "ILU")
                        .param("tipo", "PRA").param("fase", "EXE").param("status", "Aprovado").param("acesso", "Público")
                        .with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.erro", containsString("formato")));

        /* CREATE: documento novo (R00), renomeado e gravado na pasta do prédio/disciplina */
        String r0 = mvc.perform(inclusao("/api/documentos", "planta original.pdf", "conteudo-r0").param("predio", "POA-F-1")
                        .param("disc", "ELE").param("sis", "ILU").param("tipo", "PRA").param("fase", "EXE")
                        .param("status", "Aprovado").param("acesso", "Público").param("comentario", "Térreo: iluminação")
                        .with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        int seq = (Integer) ler(r0, "$.seq");
        String pad = String.format("%05d", seq);
        Path arqR0 = arquivoService.caminho("acervo/POA-F-1/ELETRICA", "POA-F-1-ELE-ILU-PRA-" + pad + "-R00.pdf");
        assertTrue(Files.exists(arqR0), "arquivo R00 gravado na pasta do acervo");

        /* nova revisão aprovada: a R00 passa a Substituído */
        mvc.perform(inclusao("/api/documentos/" + seq + "/revisoes", "planta v2.dwg", "conteudo-r1").param("fase", "EXE")
                        .param("status", "Aprovado").param("acesso", "Público").with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.rev").value(1))
                .andExpect(jsonPath("$.nomeArquivo").value("POA-F-1-ELE-ILU-PRA-" + pad + "-R01.dwg"));
        String a1 = acervo();
        assertTrue(ler(a1, "$.docs[?(@.seq == " + seq + " && @.rev == 0)].status").toString().contains("Substituído"));
        assertTrue(ler(a1, "$.docs[?(@.seq == " + seq + " && @.rev == 1)].status").toString().contains("Aprovado"));

        /* UPDATE: edição das informações da R01 vai para o histórico */
        mvc.perform(put("/api/documentos/" + seq + "/revisoes/1").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fase\":\"EXE\",\"status\":\"Aprovado\",\"acesso\":\"Público\",\"comentario\":\"Térreo: novos circuitos\",\"ticket\":\"123\",\"sei\":\"\"}")
                        .with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/acervo")).andExpect(jsonPath("$.hist['" + seq + "'][0].acao").value("Informações da R01 editadas"));

        /* correção de classificação: só gestor; renomeia e move os arquivos */
        String correcao = "{\"predio\":\"PEL-F-1\",\"disc\":\"CIV\",\"sis\":\"OBR\",\"tipo\":\"RDO\",\"justificativa\":\"Classificado no prédio errado\"}";
        mvc.perform(put("/api/documentos/" + seq + "/classificacao").contentType(MediaType.APPLICATION_JSON).content(correcao)
                        .with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/documentos/" + seq + "/classificacao").contentType(MediaType.APPLICATION_JSON).content(correcao)
                        .with(httpBasic("gestor", "senha2")))
                .andExpect(status().isNoContent());
        assertFalse(Files.exists(arqR0), "arquivo antigo saiu do lugar");
        Path novoR0 = arquivoService.caminho("acervo/PEL-F-1/CIVIL", "PEL-F-1-CIV-OBR-RDO-" + pad + "-R00.pdf");
        assertTrue(Files.exists(novoR0), "arquivo renomeado na pasta nova");
        String a2 = acervo();
        assertTrue(ler(a2, "$.docs[?(@.seq == " + seq + ")].fase").toString().contains("OBR"), "etapa definida pelo tipo");

        /* READ: download livre de documento público, com o conteúdo gravado */
        byte[] baixado = mvc.perform(get("/api/documentos/" + seq + "/revisoes/0/arquivo")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray();
        assertArrayEquals("conteudo-r0".getBytes(StandardCharsets.UTF_8), baixado);

        /* DELETE (lixeira): a R01 sai e a R00 volta a valer */
        mvc.perform(post("/api/documentos/" + seq + "/exclusoes").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alvo\":\"rev\",\"motivo\":\"Incluída por engano\"}").with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/documentos/" + seq + "/exclusoes").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alvo\":\"rev\",\"motivo\":\"Incluída por engano\"}").with(httpBasic("gestor", "senha2")))
                .andExpect(status().isNoContent());
        String a3 = acervo();
        assertTrue(ler(a3, "$.docs[?(@.seq == " + seq + " && @.rev == 0)].status").toString().contains("Aprovado"));
        int exclusao = ((net.minidev.json.JSONArray) ler(a3, "$.docs[?(@.seq == " + seq + " && @.rev == 1)].excluido.id")).stream()
                .map(o -> (Integer) o).findFirst().orElseThrow();

        /* restaurar: a R01 aprovada volta a ser a vigente */
        mvc.perform(post("/api/exclusoes/" + exclusao + "/restauracao").with(httpBasic("gestor", "senha2")))
                .andExpect(status().isNoContent());
        String a4 = acervo();
        assertTrue(ler(a4, "$.docs[?(@.seq == " + seq + " && @.rev == 1)].excluido").toString().contains("null"));
        assertTrue(ler(a4, "$.docs[?(@.seq == " + seq + " && @.rev == 0)].status").toString().contains("Substituído"));
        assertTrue(ler(a4, "$.docs[?(@.seq == " + seq + " && @.rev == 1)].status").toString().contains("Aprovado"));

        /* sigilo: documento classificado só baixa com o gestor */
        String sig = mvc.perform(inclusao("/api/documentos", "cftv.pdf", "secreto").param("predio", "POA-F-1").param("disc", "ELE")
                        .param("sis", "ILU").param("tipo", "PRA").param("fase", "EXE").param("status", "Aprovado")
                        .param("acesso", "Informação classificada").param("sigilo", "Reservada").with(httpBasic("tecnico", "senha1")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        int seqSig = (Integer) ler(sig, "$.seq");
        mvc.perform(get("/api/documentos/" + seqSig + "/revisoes/0/arquivo")).andExpect(status().isForbidden());
        mvc.perform(get("/api/documentos/" + seqSig + "/revisoes/0/arquivo").with(httpBasic("gestor", "senha2")))
                .andExpect(status().isOk()).andExpect(content().bytes("secreto".getBytes(StandardCharsets.UTF_8)));

        /* o documento inteiro na lixeira */
        mvc.perform(post("/api/documentos/" + seqSig + "/exclusoes").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alvo\":\"doc\",\"motivo\":\"Documento duplicado no acervo\"}").with(httpBasic("gestor", "senha2")))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/acervo")).andExpect(jsonPath("$.docs[?(@.seq == " + seqSig + ")].excluido.alvo", contains("doc")));
    }
}
