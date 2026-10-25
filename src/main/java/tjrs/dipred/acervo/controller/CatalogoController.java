package tjrs.dipred.acervo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tjrs.dipred.acervo.dto.CatalogoDTO;
import tjrs.dipred.acervo.service.CatalogoService;

@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    /* prédios, disciplinas, assuntos, tipos de documento e etapas */
    @GetMapping("/catalogos")
    public ResponseEntity<CatalogoDTO> listar() {
        return ResponseEntity.ok(catalogoService.listar());
    }
}
