package tjrs.dipred.acervo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "disciplinas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Disciplina {

    @Id
    @Column(length = 4)
    private String codigo;

    @Column(nullable = false, length = 60)
    private String nome;

    /* nome da pasta da disciplina na estrutura de diretórios */
    @Column(nullable = false, unique = true, length = 40)
    private String pasta;

    @Column(nullable = false)
    private Integer ordem;
}
