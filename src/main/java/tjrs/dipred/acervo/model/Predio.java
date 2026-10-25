package tjrs.dipred.acervo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "predios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Predio {

    /* CIDADE-USO-N, ex.: POA-F-1 */
    @Id
    @Column(length = 12)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 10)
    private String imovel;
}
