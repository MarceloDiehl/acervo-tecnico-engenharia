package tjrs.dipred.acervo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tipos_documento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoDocumento {

    @Id
    @Column(length = 4)
    private String codigo;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(nullable = false, length = 40)
    private String natureza;

    /* tipos de registro (ATA, OF, ART...) já entram como Aprovado */
    @Column(nullable = false)
    private Boolean registro = false;

    /* etapa definida pelo tipo (Execução, Manutenção e inspeção, Administrativo) */
    @Column(name = "etapa_fixa", length = 3)
    private String etapaFixa;

    @Column(nullable = false)
    private Integer ordem;
}
