package tjrs.dipred.acervo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Exclusao;

@Repository
public interface ExclusaoRepository extends JpaRepository<Exclusao, Integer> {
}
