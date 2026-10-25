-- Dados de teste do Acervo Técnico de Engenharia - DIPRED-DMAN - TJRS
-- Rodar DEPOIS do db/dipred_acervo_db.sql. Não usar em produção.
--
-- Parte 1: usuários de teste e 8 documentos de exemplo (os mesmos do protótipo, agora no banco).
-- Parte 2: teste do CRUD (cria, lê, altera e apaga um documento) dentro de uma transação desfeita no fim.
-- Parte 3: conferência.
-- Parte 4 (comentada): remove os dados de teste.
--
-- Usuários (senha: teste123):
--   gestor.teste   perfil GESTOR   pode corrigir classificação, excluir e restaurar
--   tecnico.teste  perfil TECNICO  pode incluir documentos e revisões e editar informações
--
-- Os arquivos destes documentos NÃO existem na pasta do servidor: o download avisa
-- "arquivo não encontrado". Para testar o download, inclua um documento pela tela.

USE dipred_acervo_db;

-- =====================================================================
-- PARTE 1 · carga de teste
-- =====================================================================

INSERT IGNORE INTO usuarios (username, password, nome_completo, perfil, ativo) VALUES
('gestor.teste', '$2a$10$o1vvKHctWMmUootIdZ9CXOXHhfxGDDBsZ7E76jIiA6psB9mv7po9y', 'Gestor de Teste', 'GESTOR', TRUE),
('tecnico.teste', '$2a$10$o1vvKHctWMmUootIdZ9CXOXHhfxGDDBsZ7E76jIiA6psB9mv7po9y', 'Técnico de Teste', 'TECNICO', TRUE);

-- documento 1: POA-F-1 · ELE/ILU · PRA
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('POA-F-1', (SELECT id FROM assuntos WHERE disciplina_codigo = 'ELE' AND codigo = 'ILU'), 'PRA', NOW() - INTERVAL 420 DAY, 'tecnico.teste');
SET @d1 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d1, 0, 'Substituído', 'EXE', 'Acesso controlado', 'Não se aplica', '3º pavimento, ala norte: iluminação e tomadas das salas de audiência', '482113', '8.2024.0010/004512-3', 'pdf', 1843000, SHA2(CONCAT('teste-', @d1, '-', 0), 256), 'arquivo-teste-1-0.pdf', CONCAT('POA-F-1-ELE-ILU-PRA-', LPAD(@d1, 5, '0'), '-R00.pdf'), 'acervo/POA-F-1/ELETRICA', 'tecnico.teste', NOW() - INTERVAL 420 DAY);
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d1, 1, 'Aprovado', 'EXE', 'Acesso controlado', 'Não se aplica', '3º pavimento, ala norte: iluminação e tomadas das salas de audiência. Inclusão de novos circuitos.', '482113', '8.2024.0010/004512-3', 'dwg', 2950000, SHA2(CONCAT('teste-', @d1, '-', 1), 256), 'arquivo-teste-1-1.dwg', CONCAT('POA-F-1-ELE-ILU-PRA-', LPAD(@d1, 5, '0'), '-R01.dwg'), 'acervo/POA-F-1/ELETRICA', 'tecnico.teste', NOW() - INTERVAL 300 DAY);

-- documento 2: CSU-F-3 · CIV/OBR · RDO
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('CSU-F-3', (SELECT id FROM assuntos WHERE disciplina_codigo = 'CIV' AND codigo = 'OBR'), 'RDO', NOW() - INTERVAL 210 DAY, 'tecnico.teste');
SET @d2 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d2, 0, 'Aprovado', 'OBR', 'Público', 'Não se aplica', 'Cobertura: impermeabilização da laje técnica, semana 12', NULL, NULL, 'pdf', 640000, SHA2(CONCAT('teste-', @d2, '-', 0), 256), 'arquivo-teste-2-0.pdf', CONCAT('CSU-F-3-CIV-OBR-RDO-', LPAD(@d2, 5, '0'), '-R00.pdf'), 'acervo/CSU-F-3/CIVIL', 'tecnico.teste', NOW() - INTERVAL 210 DAY);

-- documento 3: PEL-F-1 · ARQ/EDI · PRA
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('PEL-F-1', (SELECT id FROM assuntos WHERE disciplina_codigo = 'ARQ' AND codigo = 'EDI'), 'PRA', NOW() - INTERVAL 380 DAY, 'gestor.teste');
SET @d3 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d3, 0, 'Aprovado', 'BAS', 'Acesso controlado', 'Não se aplica', 'Fachada principal: elevações e esquadrias', NULL, '8.2023.0010/011873-0', 'pdf', 2210000, SHA2(CONCAT('teste-', @d3, '-', 0), 256), 'arquivo-teste-3-0.pdf', CONCAT('PEL-F-1-ARQ-EDI-PRA-', LPAD(@d3, 5, '0'), '-R00.pdf'), 'acervo/PEL-F-1/ARQUITETURA', 'gestor.teste', NOW() - INTERVAL 380 DAY);
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d3, 1, 'Em elaboração', 'EXE', 'Acesso controlado', 'Não se aplica', 'Fachada principal: elevações e esquadrias. Correção de cotas.', NULL, '8.2023.0010/011873-0', 'dwg', 3120000, SHA2(CONCAT('teste-', @d3, '-', 1), 256), 'arquivo-teste-3-1.dwg', CONCAT('PEL-F-1-ARQ-EDI-PRA-', LPAD(@d3, 5, '0'), '-R01.dwg'), 'acervo/PEL-F-1/ARQUITETURA', 'tecnico.teste', NOW() - INTERVAL 40 DAY);

-- documento 4: SMA-F-1 · TEL/LOG · LIS
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('SMA-F-1', (SELECT id FROM assuntos WHERE disciplina_codigo = 'TEL' AND codigo = 'LOG'), 'LIS', NOW() - INTERVAL 25 DAY, 'tecnico.teste');
SET @d4 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d4, 0, 'Em elaboração', 'BAS', 'Acesso controlado', 'Não se aplica', 'Cartórios: rack e pontos de rede', '517220', NULL, 'xlsx', 98000, SHA2(CONCAT('teste-', @d4, '-', 0), 256), 'arquivo-teste-4-0.xlsx', CONCAT('SMA-F-1-TEL-LOG-LIS-', LPAD(@d4, 5, '0'), '-R00.xlsx'), 'acervo/SMA-F-1/TELECOMUNICACOES', 'tecnico.teste', NOW() - INTERVAL 25 DAY);

-- documento 5: CAN-F-4 · MEC/CLI · ART
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('CAN-F-4', (SELECT id FROM assuntos WHERE disciplina_codigo = 'MEC' AND codigo = 'CLI'), 'ART', NOW() - INTERVAL 150 DAY, 'tecnico.teste');
SET @d5 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d5, 0, 'Aprovado', 'NA', 'Público', 'Não se aplica', 'ART do projeto de climatização das salas de audiência', NULL, NULL, 'pdf', 210000, SHA2(CONCAT('teste-', @d5, '-', 0), 256), 'arquivo-teste-5-0.pdf', CONCAT('CAN-F-4-MEC-CLI-ART-', LPAD(@d5, 5, '0'), '-R00.pdf'), 'acervo/CAN-F-4/MECANICA', 'tecnico.teste', NOW() - INTERVAL 150 DAY);

-- documento 6: POA-A-9 · TEL/CFTV · PRA
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('POA-A-9', (SELECT id FROM assuntos WHERE disciplina_codigo = 'TEL' AND codigo = 'CFTV'), 'PRA', NOW() - INTERVAL 95 DAY, 'gestor.teste');
SET @d6 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d6, 0, 'Aprovado', 'EXE', 'Informação classificada', 'Reservada', 'Perímetro: posicionamento das câmeras e central de monitoramento', NULL, NULL, 'pdf', 1530000, SHA2(CONCAT('teste-', @d6, '-', 0), 256), 'arquivo-teste-6-0.pdf', CONCAT('POA-A-9-TEL-CFTV-PRA-', LPAD(@d6, 5, '0'), '-R00.pdf'), 'acervo/POA-A-9/TELECOMUNICACOES', 'gestor.teste', NOW() - INTERVAL 95 DAY);

-- documento 7: NHA-F-1 · ELE/SPDA · LAU
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('NHA-F-1', (SELECT id FROM assuntos WHERE disciplina_codigo = 'ELE' AND codigo = 'SPDA'), 'LAU', NOW() - INTERVAL 60 DAY, 'tecnico.teste');
SET @d7 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d7, 0, 'Aprovado', 'MAN', 'Público', 'Não se aplica', 'Captores, descidas e malha de aterramento: inspeção anual', '530041', NULL, 'pdf', 760000, SHA2(CONCAT('teste-', @d7, '-', 0), 256), 'arquivo-teste-7-0.pdf', CONCAT('NHA-F-1-ELE-SPDA-LAU-', LPAD(@d7, 5, '0'), '-R00.pdf'), 'acervo/NHA-F-1/ELETRICA', 'tecnico.teste', NOW() - INTERVAL 60 DAY);

-- documento 8: BGO-F-1 · CIV/GUT · REL
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por) VALUES ('BGO-F-1', (SELECT id FROM assuntos WHERE disciplina_codigo = 'CIV' AND codigo = 'GUT'), 'REL', NOW() - INTERVAL 130 DAY, 'gestor.teste');
SET @d8 = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d8, 0, 'Aprovado', 'MAN', 'Acesso controlado', 'Não se aplica', 'Vistoria predial: matriz GUT da fachada e cobertura', NULL, '8.2025.0010/002231-7', 'pdf', 1120000, SHA2(CONCAT('teste-', @d8, '-', 0), 256), 'arquivo-teste-8-0.pdf', CONCAT('BGO-F-1-CIV-GUT-REL-', LPAD(@d8, 5, '0'), '-R00.pdf'), 'acervo/BGO-F-1/CIVIL', 'gestor.teste', NOW() - INTERVAL 130 DAY);
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, ticket, sei, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em) VALUES
  (@d8, 1, 'Em elaboração', 'MAN', 'Acesso controlado', 'Não se aplica', 'Vistoria predial: matriz GUT. Revisão incluída por engano.', NULL, '8.2025.0010/002231-7', 'pdf', 1120000, SHA2(CONCAT('teste-', @d8, '-', 1), 256), 'arquivo-teste-8-1.pdf', CONCAT('BGO-F-1-CIV-GUT-REL-', LPAD(@d8, 5, '0'), '-R01.pdf'), 'acervo/BGO-F-1/CIVIL', 'tecnico.teste', NOW() - INTERVAL 10 DAY);
-- a R01 do documento 8 está na lixeira (incluída por engano)
INSERT INTO exclusoes (documento_seq, alvo, revisao_numero, motivo, excluido_por, excluido_em) VALUES (@d8, 'REVISAO', 1, 'Revisão incluída por engano: arquivo igual ao da R00.', 'gestor.teste', NOW() - INTERVAL 5 DAY);
UPDATE revisoes SET exclusao_id = LAST_INSERT_ID() WHERE documento_seq = @d8 AND numero = 1;
INSERT INTO historico (documento_seq, quando, usuario, acao, detalhe) VALUES (@d8, NOW() - INTERVAL 5 DAY, 'gestor.teste', 'Revisão R01 excluída', 'Justificativa: Revisão incluída por engano: arquivo igual ao da R00.');

-- uma alteração registrada no histórico, para aparecer em "alterações registradas"
INSERT INTO historico (documento_seq, quando, usuario, acao, detalhe) VALUES
  (@d1, NOW() - INTERVAL 200 DAY, 'tecnico.teste', 'Informações da R01 editadas', 'Número do ticket: — → 482113\nDescrição atualizada');

-- =====================================================================
-- PARTE 2 · teste do CRUD (tudo é desfeito pelo ROLLBACK no fim)
-- =====================================================================

START TRANSACTION;

-- CREATE: documento novo com a revisão R00
INSERT INTO documentos (predio_codigo, assunto_id, tipo_codigo, criado_em, criado_por)
VALUES ('VIA-F-1', (SELECT id FROM assuntos WHERE disciplina_codigo = 'ELE' AND codigo = 'ENE'), 'MEM', NOW(), 'tecnico.teste');
SET @t = LAST_INSERT_ID();
INSERT INTO revisoes (documento_seq, numero, status, etapa_codigo, acesso, sigilo, descricao, extensao, tamanho, hash_sha256, nome_original, nome_arquivo, diretorio, incluido_por, incluido_em)
VALUES (@t, 0, 'Em elaboração', 'EXE', 'Público', 'Não se aplica', 'Teste do CRUD', 'pdf', 1000, SHA2('crud', 256), 'crud.pdf',
        CONCAT('VIA-F-1-ELE-ENE-MEM-', LPAD(@t, 5, '0'), '-R00.pdf'), 'acervo/VIA-F-1/ELETRICA', 'tecnico.teste', NOW());

-- READ: o documento com a classificação completa
SELECT d.seq, r.nome_arquivo, p.nome AS predio, di.nome AS disciplina, a.nome AS assunto, t.nome AS tipo, r.status, e.nome AS etapa
FROM documentos d
JOIN revisoes r ON r.documento_seq = d.seq
JOIN predios p ON p.codigo = d.predio_codigo
JOIN assuntos a ON a.id = d.assunto_id
JOIN disciplinas di ON di.codigo = a.disciplina_codigo
JOIN tipos_documento t ON t.codigo = d.tipo_codigo
JOIN etapas e ON e.codigo = r.etapa_codigo
WHERE d.seq = @t;

-- UPDATE: aprova a revisão e registra no histórico
UPDATE revisoes SET status = 'Aprovado' WHERE documento_seq = @t AND numero = 0;
INSERT INTO historico (documento_seq, quando, usuario, acao, detalhe) VALUES (@t, NOW(), 'tecnico.teste', 'Informações da R00 editadas', 'Status: Em elaboração → Aprovado');
SELECT status AS deve_ser_aprovado FROM revisoes WHERE documento_seq = @t AND numero = 0;

-- DELETE: apaga o documento (histórico, revisões e documento, nesta ordem por causa das chaves estrangeiras)
DELETE FROM historico WHERE documento_seq = @t;
DELETE FROM revisoes WHERE documento_seq = @t;
DELETE FROM documentos WHERE seq = @t;
SELECT COUNT(*) AS deve_ser_zero FROM documentos WHERE seq = @t;

ROLLBACK;

-- =====================================================================
-- PARTE 3 · conferência
-- =====================================================================

SELECT
  (SELECT COUNT(*) FROM predios) AS predios,              -- 217
  (SELECT COUNT(*) FROM disciplinas) AS disciplinas,      -- 5
  (SELECT COUNT(*) FROM assuntos) AS assuntos,            -- 15
  (SELECT COUNT(*) FROM tipos_documento) AS tipos,        -- 22
  (SELECT COUNT(*) FROM etapas) AS etapas,                -- 8
  (SELECT COUNT(*) FROM usuarios) AS usuarios,
  (SELECT COUNT(*) FROM documentos) AS documentos,
  (SELECT COUNT(*) FROM revisoes) AS revisoes,
  (SELECT COUNT(*) FROM revisoes WHERE exclusao_id IS NOT NULL) AS na_lixeira;

-- o acervo como a tela mostra (revisão vigente = maior revisão aprovada fora da lixeira)
SELECT d.seq, CONCAT(d.predio_codigo, '-', a.disciplina_codigo, '-', a.codigo, '-', d.tipo_codigo, '-', LPAD(d.seq, 5, '0')) AS codigo,
       r.numero AS rev, r.status, r.acesso, r.nome_arquivo, r.diretorio, IF(r.exclusao_id IS NULL, '', 'lixeira') AS situacao
FROM documentos d
JOIN assuntos a ON a.id = d.assunto_id
JOIN revisoes r ON r.documento_seq = d.seq
ORDER BY d.seq, r.numero;

-- =====================================================================
-- PARTE 4 · remover os dados de teste (tire os comentários para rodar)
-- =====================================================================

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE historico;
-- TRUNCATE revisoes;
-- TRUNCATE exclusoes;
-- TRUNCATE documentos;
-- DELETE FROM usuarios WHERE username IN ('gestor.teste', 'tecnico.teste');
-- SET FOREIGN_KEY_CHECKS = 1;
