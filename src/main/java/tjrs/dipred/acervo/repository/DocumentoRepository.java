package tjrs.dipred.acervo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Documento;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Integer> {

    @Query("select d from Documento d join fetch d.predio join fetch d.assunto a join fetch a.disciplina join fetch d.tipo where d.seq = :seq")
    Optional<Documento> buscar(@Param("seq") Integer seq);

    @Query("select coalesce(max(d.seq), 0) from Documento d")
    Integer maiorSeq();
}
