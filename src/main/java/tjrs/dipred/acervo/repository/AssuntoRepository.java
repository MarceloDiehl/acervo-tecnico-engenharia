package tjrs.dipred.acervo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Assunto;

@Repository
public interface AssuntoRepository extends JpaRepository<Assunto, Integer> {

    @Query("select a from Assunto a join fetch a.disciplina d order by d.ordem, a.ordem")
    List<Assunto> listarTodos();

    @Query("select a from Assunto a join fetch a.disciplina d where d.codigo = :disciplina and a.codigo = :codigo")
    Optional<Assunto> buscar(@Param("disciplina") String disciplina, @Param("codigo") String codigo);
}
