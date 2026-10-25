package tjrs.dipred.acervo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Disciplina;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, String> {
    List<Disciplina> findAllByOrderByOrdemAsc();
}
