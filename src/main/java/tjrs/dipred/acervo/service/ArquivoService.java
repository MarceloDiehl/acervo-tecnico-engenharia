package tjrs.dipred.acervo.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import tjrs.dipred.acervo.model.Disciplina;
import tjrs.dipred.acervo.model.Predio;

/*
 * Grava e lê os arquivos do acervo na estrutura de pastas do servidor.
 * O banco guarda só o diretório (relativo à raiz) e o nome do arquivo.
 *
 *   <raiz>/acervo/<PRÉDIO>/<DISCIPLINA>/<nome gerado>
 *   <raiz>/temporario/                    recebimento dos envios
 */
@Service
public class ArquivoService {

    public static final String PASTA_ACERVO = "acervo";
    public static final String PASTA_TEMPORARIA = "temporario";

    private final Path raiz;

    public ArquivoService(@Value("${acervo.arquivos.raiz}") String raiz) {
        this.raiz = Paths.get(raiz).toAbsolutePath().normalize();
    }

    public Path getRaiz() {
        return raiz;
    }

    /* arquivo recebido e ainda na pasta temporária */
    public record Recebido(Path temporario, String hash, long tamanho) {
    }

    public String diretorio(Predio predio, Disciplina disciplina) {
        return PASTA_ACERVO + "/" + predio.getCodigo() + "/" + disciplina.getPasta();
    }

    /* cria as pastas que faltarem; devolve quantas foram criadas */
    public int prepararEstrutura(List<Predio> predios, List<Disciplina> disciplinas) throws IOException {
        int criadas = 0;
        Path temporaria = raiz.resolve(PASTA_TEMPORARIA);
        if (!Files.isDirectory(temporaria)) {
            Files.createDirectories(temporaria);
            criadas++;
        }
        for (Predio p : predios) {
            for (Disciplina d : disciplinas) {
                Path pasta = raiz.resolve(diretorio(p, d));
                if (!Files.isDirectory(pasta)) {
                    Files.createDirectories(pasta);
                    criadas++;
                }
            }
        }
        return criadas;
    }

    /* copia o envio para a pasta temporária, calculando o SHA-256 no caminho */
    public Recebido receber(MultipartFile arquivo) throws IOException {
        Path temporario = raiz.resolve(PASTA_TEMPORARIA).resolve(UUID.randomUUID() + ".part");
        Files.createDirectories(temporario.getParent());
        MessageDigest sha256;
        try {
            sha256 = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
        try (InputStream in = new DigestInputStream(arquivo.getInputStream(), sha256)) {
            long tamanho = Files.copy(in, temporario);
            return new Recebido(temporario, HexFormat.of().formatHex(sha256.digest()), tamanho);
        } catch (IOException e) {
            descartar(temporario);
            throw e;
        }
    }

    /* move o arquivo da pasta temporária para o acervo; nunca sobrescreve */
    public Path guardar(Path temporario, String diretorio, String nomeArquivo) throws IOException {
        Path destino = caminho(diretorio, nomeArquivo);
        if (Files.exists(destino)) {
            throw new IllegalStateException("Já existe o arquivo " + nomeArquivo + " na pasta do acervo.");
        }
        Files.createDirectories(destino.getParent());
        Files.move(temporario, destino);
        return destino;
    }

    /* renomeia/move um arquivo do acervo; devolve false se o arquivo de origem não existe */
    public boolean mover(String dirOrigem, String nomeOrigem, String dirDestino, String nomeDestino) throws IOException {
        Path origem = caminho(dirOrigem, nomeOrigem);
        Path destino = caminho(dirDestino, nomeDestino);
        if (origem.equals(destino) || !Files.exists(origem)) {
            return false;
        }
        if (Files.exists(destino)) {
            throw new IllegalStateException("Já existe o arquivo " + nomeDestino + " na pasta do acervo.");
        }
        Files.createDirectories(destino.getParent());
        Files.move(origem, destino);
        return true;
    }

    public void descartar(Path arquivo) {
        try {
            Files.deleteIfExists(arquivo);
        } catch (IOException ignorado) {
            // fica para limpeza manual da pasta temporária
        }
    }

    /* caminho absoluto, sempre dentro da raiz */
    public Path caminho(String diretorio, String nomeArquivo) {
        Path p = raiz.resolve(diretorio).resolve(nomeArquivo).normalize();
        if (!p.startsWith(raiz)) {
            throw new IllegalArgumentException("Caminho de arquivo inválido.");
        }
        return p;
    }
}
