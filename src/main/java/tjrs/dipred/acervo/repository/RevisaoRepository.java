package tjrs.dipred.acervo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tjrs.dipred.acervo.model.Exclusao;
import tjrs.dipred.acervo.model.Revisao;

@Repository
public interface RevisaoRepository extends JpaRepository<Revisao, Integer> {

    /* tudo o que a tela de pesquisa precisa, numa consulta só */
    @Query("select r from Revisao r join fetch r.documento d join fetch d.predio join fetch d.assunto a join fetch a.disciplina"
            + " join fetch d.tipo join fetch r.etapa left join fetch r.exclusao order by d.seq, r.numero")
    List<Revisao> listarTodas();

    /* todas as revisões do documento, inclusive as que estão na lixeira */
    @Query("select r from Revisao r join fetch r.etapa left join fetch r.exclusao where r.documento.seq = :seq order by r.numero")
    List<Revisao> doDocumento(@Param("seq") Integer seq);

    List<Revisao> findByExclusao(Exclusao exclusao);
}
