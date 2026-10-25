package tjrs.dipred.acervo.config;

import java.io.IOException;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/* erros da API sempre como {"erro": "mensagem"}, para o front mostrar no aviso */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalido(IllegalArgumentException e) {
        return erro(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflito(IllegalStateException e) {
        return erro(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> naoEncontrado(NoSuchElementException e) {
        return erro(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> semAcesso(AccessDeniedException e) {
        return erro(HttpStatus.FORBIDDEN, e.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> grandeDemais(MaxUploadSizeExceededException e) {
        return erro(HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo passa do tamanho máximo permitido.");
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> disco(IOException e) {
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível gravar o arquivo na pasta do servidor.");
    }

    private static ResponseEntity<Map<String, String>> erro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem == null ? status.getReasonPhrase() : mensagem));
    }
}
