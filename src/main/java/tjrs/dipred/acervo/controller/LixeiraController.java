package tjrs.dipred.acervo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tjrs.dipred.acervo.service.DocumentoService;

/* gestor: restaura da lixeira um documento ou uma revisão excluída */
@RestController
@RequestMapping("/api/exclusoes")
public class LixeiraController {

    private final DocumentoService documentoService;

    public LixeiraController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping("/{id}/restauracao")
    public ResponseEntity<Void> restaurar(@PathVariable Integer id, Authentication authentication) {
        documentoService.restaurar(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
