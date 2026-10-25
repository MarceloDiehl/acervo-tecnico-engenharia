package tjrs.dipred.acervo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Predio;

@Repository
public interface PredioRepository extends JpaRepository<Predio, String> {
    List<Predio> findAllByOrderByNomeAsc();
}
