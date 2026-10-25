package tjrs.dipred.acervo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "etapas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Etapa {

    @Id
    @Column(length = 3)
    private String codigo;

    @Column(nullable = false, length = 60)
    private String nome;

    @Column(nullable = false)
    private Integer ordem;
}
