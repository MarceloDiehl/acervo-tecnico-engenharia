package tjrs.dipred.acervo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Etapa;

@Repository
public interface EtapaRepository extends JpaRepository<Etapa, String> {
    List<Etapa> findAllByOrderByOrdemAsc();
}
