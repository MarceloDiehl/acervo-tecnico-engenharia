package tjrs.dipred.acervo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Historico;

@Repository
public interface HistoricoRepository extends JpaRepository<Historico, Integer> {

    @Query("select h from Historico h join fetch h.documento order by h.quando, h.id")
    List<Historico> listarTodos();
}
