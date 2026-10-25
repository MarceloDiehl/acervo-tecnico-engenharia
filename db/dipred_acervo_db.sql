-- Script de criação do banco do Acervo Técnico de Engenharia - DIPRED-DMAN - TJRS
-- Rodar no MySQL como root (ou usuário com permissão de criar bancos).
-- Pode ser executado mais de uma vez: não apaga dados existentes.
-- Os arquivos NÃO ficam no banco: aqui ficam só os dados e o caminho (diretorio + nome_arquivo)
-- relativo à pasta raiz configurada em acervo.arquivos.raiz.

CREATE DATABASE IF NOT EXISTS dipred_acervo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON dipred_acervo_db.* TO 'dipred_user'@'localhost';
FLUSH PRIVILEGES;
USE dipred_acervo_db;

-- ---------- catálogos ----------

CREATE TABLE IF NOT EXISTS etapas (
    codigo VARCHAR(3) PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    ordem INT NOT NULL
);

CREATE TABLE IF NOT EXISTS disciplinas (
    codigo VARCHAR(4) PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    pasta VARCHAR(40) NOT NULL UNIQUE,
    ordem INT NOT NULL
);

CREATE TABLE IF NOT EXISTS assuntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disciplina_codigo VARCHAR(4) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    dica VARCHAR(200),
    ordem INT NOT NULL,
    FOREIGN KEY (disciplina_codigo) REFERENCES disciplinas(codigo),
    UNIQUE KEY uq_assunto (disciplina_codigo, codigo)
);

CREATE TABLE IF NOT EXISTS tipos_documento (
    codigo VARCHAR(4) PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    natureza VARCHAR(40) NOT NULL,
    registro BOOLEAN NOT NULL DEFAULT FALSE,   -- tipos de registro (ATA, OF, ART...) já entram como Aprovado
    etapa_fixa VARCHAR(3),                     -- etapa definida pelo tipo (Execução, Manutenção, Administrativo)
    ordem INT NOT NULL,
    FOREIGN KEY (etapa_fixa) REFERENCES etapas(codigo)
);

CREATE TABLE IF NOT EXISTS predios (
    codigo VARCHAR(12) PRIMARY KEY,            -- CIDADE-USO-N, ex.: POA-F-1
    nome VARCHAR(150) NOT NULL,
    imovel VARCHAR(10)
);

-- ---------- usuários ----------

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,            -- BCrypt
    nome_completo VARCHAR(100),
    perfil VARCHAR(10) NOT NULL DEFAULT 'TECNICO',   -- TECNICO ou GESTOR
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- acervo ----------

CREATE TABLE IF NOT EXISTS documentos (
    seq INT AUTO_INCREMENT PRIMARY KEY,        -- número sequencial do documento (nunca reaproveitado)
    predio_codigo VARCHAR(12) NOT NULL,
    assunto_id INT NOT NULL,                   -- o assunto define também a disciplina
    tipo_codigo VARCHAR(4) NOT NULL,
    criado_em DATETIME NOT NULL,
    criado_por VARCHAR(50) NOT NULL,
    FOREIGN KEY (predio_codigo) REFERENCES predios(codigo),
    FOREIGN KEY (assunto_id) REFERENCES assuntos(id),
    FOREIGN KEY (tipo_codigo) REFERENCES tipos_documento(codigo)
);

CREATE TABLE IF NOT EXISTS exclusoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_seq INT NOT NULL,
    alvo VARCHAR(10) NOT NULL,                 -- DOCUMENTO ou REVISAO
    revisao_numero INT NOT NULL,
    motivo VARCHAR(300) NOT NULL,
    excluido_por VARCHAR(50) NOT NULL,
    excluido_em DATETIME NOT NULL,
    restaurado_por VARCHAR(50),
    restaurado_em DATETIME,
    FOREIGN KEY (documento_seq) REFERENCES documentos(seq)
);

-- cada revisão tem exatamente um arquivo
CREATE TABLE IF NOT EXISTS revisoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_seq INT NOT NULL,
    numero INT NOT NULL,                       -- R00, R01...
    status VARCHAR(20) NOT NULL,               -- Em elaboração, Aprovado, Substituído, Cancelado
    etapa_codigo VARCHAR(3) NOT NULL,
    acesso VARCHAR(30) NOT NULL,               -- Público, Acesso controlado, Informação classificada
    sigilo VARCHAR(20) NOT NULL DEFAULT 'Não se aplica',
    descricao VARCHAR(500),
    ticket VARCHAR(24),
    sei VARCHAR(24),
    extensao VARCHAR(5) NOT NULL,
    tamanho BIGINT NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    nome_original VARCHAR(255),
    nome_arquivo VARCHAR(120) NOT NULL,        -- nome gerado: PRÉDIO-DISC-SIS-TIPO-SEQ-Rnn.ext
    diretorio VARCHAR(255) NOT NULL,           -- relativo à raiz, ex.: acervo/POA-F-1/ELETRICA
    incluido_por VARCHAR(50) NOT NULL,
    incluido_em DATETIME NOT NULL,
    exclusao_id INT,                           -- preenchido quando está na lixeira
    FOREIGN KEY (documento_seq) REFERENCES documentos(seq),
    FOREIGN KEY (etapa_codigo) REFERENCES etapas(codigo),
    FOREIGN KEY (exclusao_id) REFERENCES exclusoes(id),
    UNIQUE KEY uq_revisao (documento_seq, numero),
    KEY ix_revisao_hash (hash_sha256)
);

-- alterações registradas (edição, correção de classificação, exclusão e restauração)
CREATE TABLE IF NOT EXISTS historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_seq INT NOT NULL,
    quando DATETIME NOT NULL,
    usuario VARCHAR(50) NOT NULL,
    acao VARCHAR(150) NOT NULL,
    detalhe TEXT,
    FOREIGN KEY (documento_seq) REFERENCES documentos(seq)
);

-- ---------- carga dos catálogos ----------

-- ETAPAS
INSERT IGNORE INTO etapas (codigo, nome, ordem) VALUES
('EST', 'Estudo Preliminar', 1),
('ANT', 'Anteprojeto', 2),
('BAS', 'Projeto Básico', 3),
('EXE', 'Projeto Executivo', 4),
('OBR', 'Obra', 5),
('ASB', 'As Built', 6),
('MAN', 'Uso e Manutenção', 7),
('NA', 'Não se Aplica', 8);

-- DISCIPLINAS
INSERT IGNORE INTO disciplinas (codigo, nome, pasta, ordem) VALUES
('ARQ', 'Arquitetura', 'ARQUITETURA', 1),
('CIV', 'Civil', 'CIVIL', 2),
('ELE', 'Elétrica', 'ELETRICA', 3),
('TEL', 'Telecomunicações', 'TELECOMUNICACOES', 4),
('MEC', 'Mecânica', 'MECANICA', 5);

-- ASSUNTOS (por disciplina)
INSERT IGNORE INTO assuntos (disciplina_codigo, codigo, nome, dica, ordem) VALUES
('ARQ', 'EDI', 'Projeto de edificação', 'plantas, cortes, elevações, fachadas, esquadrias, detalhamentos, paisagismo, restauro', 1),
('ARQ', 'LAY', 'Layout interno', 'mobiliário, divisórias, comunicação visual, acessibilidade', 2),
('CIV', 'EST', 'Estruturas', 'fundações, contenções, topografia, sondagem, recuperação estrutural', 1),
('CIV', 'OBR', 'Obras civis', 'alvenaria, pisos, forros, pintura, cobertura, impermeabilização, calçadas, muros', 2),
('CIV', 'GUT', 'Vistoria', 'vistoria predial, matriz GUT, inspeção geral do prédio', 3),
('ELE', 'ENE', 'Energia e distribuição', 'entrada, subestação, no-break, quadros', 1),
('ELE', 'ILU', 'Iluminação e tomadas', 'circuitos de baixa tensão', 2),
('ELE', 'SPDA', 'SPDA', 'inclui aterramento', 3),
('TEL', 'LOG', 'Rede lógica', 'cabeamento, racks, wi-fi', 1),
('TEL', 'TEL', 'Telefonia', NULL, 2),
('TEL', 'CFTV', 'CFTV', 'câmeras, gravadores, controle de acesso, alarme de intrusão', 3),
('TEL', 'AV', 'Áudio, vídeo e automação', 'salas de audiência, videoconferência, automação predial', 4),
('MEC', 'CLI', 'Climatização', 'ar-condicionado, ventilação, exaustão', 1),
('MEC', 'ELE', 'Elevadores', 'inclui plataformas elevatórias', 2),
('MEC', 'GMG', 'Gerador', 'grupo motor-gerador, tanque de combustível, quadro de transferência', 3);

-- TIPOS DE DOCUMENTO
INSERT IGNORE INTO tipos_documento (codigo, nome, natureza, registro, etapa_fixa, ordem) VALUES
('PRA', 'Prancha', 'Projeto', FALSE, NULL, 1),
('MEM', 'Memorial descritivo', 'Projeto', FALSE, NULL, 2),
('MC', 'Memória de cálculo', 'Projeto', FALSE, NULL, 3),
('ET', 'Especificação técnica', 'Projeto', FALSE, NULL, 4),
('LIS', 'Lista de materiais e quantitativos', 'Projeto', FALSE, NULL, 5),
('RDO', 'Relatório diário de obra', 'Execução', TRUE, 'OBR', 6),
('MED', 'Medição', 'Execução', TRUE, 'OBR', 7),
('CRO', 'Cronograma', 'Execução', FALSE, 'OBR', 8),
('TRB', 'Termo de recebimento', 'Execução', TRUE, 'OBR', 9),
('LAU', 'Laudo', 'Manutenção e inspeção', FALSE, 'MAN', 10),
('REL', 'Relatório técnico', 'Manutenção e inspeção', FALSE, 'MAN', 11),
('PT', 'Parecer / nota técnica', 'Manutenção e inspeção', FALSE, 'MAN', 12),
('POP', 'Procedimento', 'Manutenção e inspeção', FALSE, 'MAN', 13),
('PMN', 'Plano de manutenção', 'Manutenção e inspeção', FALSE, 'MAN', 14),
('MAN', 'Manual / catálogo técnico', 'Manutenção e inspeção', FALSE, 'MAN', 15),
('ART', 'ART/RRT', 'Administrativo', TRUE, 'NA', 16),
('ORC', 'Orçamento', 'Administrativo', FALSE, 'NA', 17),
('TR', 'Termo de referência', 'Administrativo', FALSE, 'NA', 18),
('OS', 'Ordem de serviço', 'Administrativo', TRUE, 'NA', 19),
('OF', 'Ofício', 'Administrativo', TRUE, 'NA', 20),
('ATA', 'Ata', 'Administrativo', TRUE, 'NA', 21),
('ALV', 'Alvará / licença', 'Administrativo', TRUE, 'NA', 22);

-- PREDIOS
INSERT IGNORE INTO predios (codigo, nome, imovel) VALUES
('AGU-F-1', 'Agudo', 'IMV-0001'),
('ALE-F-1', 'Alegrete', 'IMV-0002'),
('ALV-F-1', 'Alvorada', 'IMV-0003'),
('APR-F-1', 'Antônio Prado', 'IMV-0004'),
('AME-F-1', 'Arroio do Meio', 'IMV-0005'),
('ATI-F-1', 'Arroio do Tigre', 'IMV-0006'),
('AGR-F-1', 'Arroio Grande', 'IMV-0007'),
('ARV-F-1', 'Arvorezinha', 'IMV-0008'),
('APE-F-1', 'Augusto Pestana', 'IMV-0009'),
('BAG-F-1', 'Bagé', 'IMV-0010'),
('BRI-S-1', 'Barra do Ribeiro (Antigo)', 'IMV-0011'),
('BRI-F-1', 'Barra do Ribeiro (Novo)', 'IMV-0012'),
('BGO-F-1', 'Bento Gonçalves', 'IMV-0013'),
('BJE-F-1', 'Bom Jesus', 'IMV-0014'),
('BUT-F-1', 'Butiá', 'IMV-0015'),
('CSU-S-1', 'Caçapava do Sul (Antigo)', 'IMV-0016'),
('CSU-F-1', 'Caçapava do Sul (Novo)', 'IMV-0017'),
('CAC-F-1', 'Cacequi', 'IMV-0018'),
('CSU-F-2', 'Cachoeira do Sul', 'IMV-0019'),
('CAC-F-2', 'Cachoeirinha', 'IMV-0020'),
('CAM-F-1', 'Camaquã', 'IMV-0021'),
('CMI-F-1', 'Campina das Missões', 'IMV-0022'),
('CBO-F-1', 'Campo Bom', 'IMV-0023'),
('CNO-F-1', 'Campo Novo', 'IMV-0024'),
('CAN-S-1', 'Candelária (2º pav. BB)', 'IMV-0025'),
('CAN-F-1', 'Candelária (Novo)', 'IMV-0026'),
('CAN-F-2', 'Canela', 'IMV-0027'),
('CAN-F-3', 'Canguçu', 'IMV-0028'),
('CAN-F-4', 'Canoas', 'IMV-0029'),
('CCA-F-1', 'Capão da Canoa (Novo)', 'IMV-0030'),
('CAR-F-1', 'Carazinho', 'IMV-0031'),
('CBA-F-1', 'Carlos Barbosa', 'IMV-0032'),
('CAS-F-1', 'Casca', 'IMV-0033'),
('CAT-F-1', 'Catuípe (Novo)', 'IMV-0034'),
('CSU-F-3', 'Caxias do Sul', 'IMV-0035'),
('CLA-F-1', 'Cerro Largo (Novo)', 'IMV-0036'),
('CHA-F-1', 'Charqueadas', 'IMV-0037'),
('CON-F-1', 'Constantina', 'IMV-0038'),
('CBI-F-1', 'Coronel Bicaco', 'IMV-0039'),
('CRI-F-1', 'Crissiumal', 'IMV-0040'),
('CAL-F-1', 'Cruz Alta', 'IMV-0041'),
('DIR-F-1', 'Dois Irmãos', 'IMV-0042'),
('DPE-F-1', 'Dom Pedrito', 'IMV-0043'),
('ESU-X-1', 'Eldorado do Sul (DARQ) (TERRENO)', 'IMV-0044'),
('ESU-F-1', 'Eldorado do Sul (Novo)', 'IMV-0045'),
('ENC-F-1', 'Encantado', 'IMV-0046'),
('ESU-F-2', 'Encruzilhada do Sul', 'IMV-0047'),
('ERE-F-1', 'Erechim', 'IMV-0048'),
('ESP-F-1', 'Espumoso (Novo)', 'IMV-0049'),
('EVE-F-1', 'Estância Velha', 'IMV-0050'),
('EST-F-1', 'Esteio', 'IMV-0051'),
('EST-O-1', 'Esteio (Novo)', 'IMV-0052'),
('EST-F-2', 'Estrela', 'IMV-0053'),
('FAR-F-1', 'Farroupilha', 'IMV-0054'),
('FSO-S-1', 'Faxinal do Soturno (2º andar BB)', 'IMV-0055'),
('FSO-F-1', 'Faxinal do Soturno (Novo)', 'IMV-0056'),
('FEL-F-1', 'Feliz', 'IMV-0057'),
('FCU-F-1', 'Flores da Cunha', 'IMV-0058'),
('FWE-F-1', 'Frederico Westphalen', 'IMV-0059'),
('GAR-F-1', 'Garibaldi', 'IMV-0060'),
('GAU-S-1', 'Gaurama (Antigo)', 'IMV-0061'),
('GAU-F-1', 'Gaurama (Novo)', 'IMV-0062'),
('GCA-F-1', 'General Câmara', 'IMV-0063'),
('GVA-F-1', 'Getúlio Vargas', 'IMV-0064'),
('GIR-F-1', 'Giruá', 'IMV-0065'),
('GRA-F-1', 'Gramado', 'IMV-0066'),
('GRA-F-2', 'Gravataí', 'IMV-0067'),
('GUA-F-1', 'Guaíba', 'IMV-0068'),
('GUA-F-2', 'Guaporé', 'IMV-0069'),
('GMI-F-1', 'Guarani das Missões', 'IMV-0070'),
('HER-F-1', 'Herval', 'IMV-0071'),
('HER-X-1', 'Herval (TERRENO)', 'IMV-0072'),
('HOR-F-1', 'Horizontina', 'IMV-0073'),
('IBI-F-1', 'Ibirubá', 'IMV-0074'),
('IGR-F-1', 'Igrejinha', 'IMV-0075'),
('IJU-F-1', 'Ijuí', 'IMV-0076'),
('IRA-F-1', 'Iraí', 'IMV-0077'),
('ITA-F-1', 'Itaqui', 'IMV-0078'),
('IVO-F-1', 'Ivoti', 'IMV-0079'),
('JAG-F-1', 'Jaguarão', 'IMV-0080'),
('JAG-S-1', 'Jaguari (2º pav. BB)', 'IMV-0081'),
('JAG-F-2', 'Jaguari (Novo)', 'IMV-0082'),
('JCA-S-1', 'Júlio de Castilhos (Antigo)', 'IMV-0083'),
('JCA-F-1', 'Júlio de Castilhos (Novo)', 'IMV-0084'),
('LVE-F-1', 'Lagoa Vermelha', 'IMV-0085'),
('LAJ-F-1', 'Lajeado', 'IMV-0086'),
('LSU-F-1', 'Lavras do Sul', 'IMV-0087'),
('MAR-F-1', 'Marau', 'IMV-0088'),
('MAR-X-1', 'Marau (TERRENO)', 'IMV-0089'),
('MRA-F-1', 'Marcelino Ramos', 'IMV-0090'),
('MON-F-1', 'Montenegro', 'IMV-0091'),
('MOS-F-1', 'Mostardas', 'IMV-0092'),
('NMT-F-1', 'Não-Me-Toque', 'IMV-0093'),
('NON-F-1', 'Nonoai', 'IMV-0094'),
('NPE-F-1', 'Nova Petrópolis', 'IMV-0095'),
('NPR-F-1', 'Nova Prata', 'IMV-0096'),
('NHA-F-1', 'Novo Hamburgo', 'IMV-0097'),
('OSO-F-1', 'Osório', 'IMV-0098'),
('PSU-F-1', 'Palmares do Sul', 'IMV-0099'),
('PMI-F-1', 'Palmeira das Missões', 'IMV-0100'),
('PMI-X-1', 'Palmeira das Missões (TERRENO)', 'IMV-0101'),
('PAN-F-1', 'Panambi', 'IMV-0102'),
('PAR-F-1', 'Parobé', 'IMV-0103'),
('PFU-F-1', 'Passo Fundo (Criminal)', 'IMV-0104'),
('PFU-F-2', 'Passo Fundo (Cível)', 'IMV-0105'),
('PFU-F-3', 'Passo Fundo - 4ª Auditoria Militar', 'IMV-0106'),
('POS-F-1', 'Pedro Osório', 'IMV-0107'),
('PEL-F-1', 'Pelotas', 'IMV-0108'),
('PMA-F-1', 'Pinheiro Machado', 'IMV-0109'),
('PIR-F-1', 'Piratini (2º pav. BB)', 'IMV-0110'),
('PLA-F-1', 'Planalto', 'IMV-0111'),
('POR-F-1', 'Portão', 'IMV-0112'),
('POA-Q-1', 'Porto Alegre - DARQ A (Administrativo)', 'IMV-0113'),
('POA-Q-2', 'Porto Alegre - DARQ B', 'IMV-0114'),
('POA-A-1', 'Porto Alegre - Ed. Glicério Alves', 'IMV-0115'),
('POA-Q-3', 'Porto Alegre - Arquivo Judicial - Assis Brasil', 'IMV-0116'),
('POA-Q-4', 'Porto Alegre - Arquivo Judicial - AERO I', 'IMV-0117'),
('POA-Q-5', 'Porto Alegre - Arquivo Judicial - AERO II', 'IMV-0118'),
('POA-Q-6', 'Porto Alegre - Depósito Judicial - Navegantes', 'IMV-0119'),
('POA-A-2', 'Porto Alegre - CJUD', 'IMV-0120'),
('POA-A-3', 'Porto Alegre - CIACA', 'IMV-0121'),
('POA-Q-7', 'Porto Alegre - Departamento de Artes Gráficas', 'IMV-0122'),
('POA-A-4', 'Porto Alegre - Departamento de Material e Patrimônio - Tenente Ary Tarragô', 'IMV-0123'),
('POA-A-5', 'Porto Alegre - Departamento de Material e Patrimônio - Madre Maria Selima', 'IMV-0124'),
('POA-A-6', 'Porto Alegre - Equipe de transportes', 'IMV-0125'),
('POA-F-1', 'Porto Alegre - Foro Central - Prédio 1', 'IMV-0126'),
('POA-F-2', 'Porto Alegre - Antiga Creche', 'IMV-0127'),
('POA-F-3', 'Porto Alegre - Foro Central - Prédio 2', 'IMV-0128'),
('POA-F-4', 'Porto Alegre - Central de Justiça (TERRENO)', 'IMV-0129'),
('POA-F-5', 'Porto Alegre - Foro Regional da Restinga', 'IMV-0130'),
('POA-X-1', 'Porto Alegre - Foro Regional da Restinga (TERRENO)', 'IMV-0131'),
('POA-F-6', 'Porto Alegre - Foro Regional da Tristeza', 'IMV-0132'),
('POA-F-7', 'Porto Alegre - Foro Regional do Alto Petrópolis', 'IMV-0133'),
('POA-F-8', 'Porto Alegre - Foro Regional do Partenon', 'IMV-0134'),
('POA-F-9', 'Porto Alegre - Foro Regional do Sarandi', 'IMV-0135'),
('POA-A-7', 'Porto Alegre - NUGESP (Novo)', 'IMV-0136'),
('POA-A-8', 'Porto Alegre - Palácio da Justiça', 'IMV-0137'),
('POA-A-9', 'Porto Alegre - Tribunal de Justiça', 'IMV-0138'),
('POA-A-10', 'Porto Alegre - Tribunal de Justiça (Anexo)', 'IMV-0139'),
('POA-A-11', 'Porto Alegre - Tribunal de Justiça Militar', 'IMV-0140'),
('POA-A-12', 'Porto Alegre - 2ª Auditoria Militar', 'IMV-0141'),
('POA-A-13', 'Porto Alegre - Aeroporto', 'IMV-0142'),
('POA-A-14', 'Porto Alegre - Estádio Arena', 'IMV-0143'),
('POA-A-15', 'Porto Alegre - Estádio Beira Rio', 'IMV-0144'),
('PXA-F-1', 'Porto Xavier', 'IMV-0145'),
('QUA-F-1', 'Quaraí', 'IMV-0146'),
('RSE-F-1', 'Restinga Seca', 'IMV-0147'),
('RGR-F-1', 'Rio Grande (Novo)', 'IMV-0148'),
('RPA-F-1', 'Rio Pardo', 'IMV-0149'),
('RBO-F-1', 'Rodeio Bonito', 'IMV-0150'),
('RAL-F-1', 'Ronda Alta', 'IMV-0151'),
('RSU-F-1', 'Rosário do Sul', 'IMV-0152'),
('SJA-F-1', 'Salto do Jacuí', 'IMV-0153'),
('SAN-F-1', 'Sananduva', 'IMV-0154'),
('SBS-F-1', 'Santa Bárbara do Sul', 'IMV-0155'),
('SCS-F-1', 'Santa Cruz do Sul', 'IMV-0156'),
('SMA-F-1', 'Santa Maria - Alameda Buenos Aires 201', 'IMV-0157'),
('SMA-F-2', 'Santa Maria - Alameda Buenos Aires 97', 'IMV-0158'),
('SRO-F-1', 'Santa Rosa', 'IMV-0159'),
('SVP-F-1', 'Santa Vitória do Palmar', 'IMV-0160'),
('SLI-F-1', 'Santana do Livramento', 'IMV-0161'),
('SAN-F-2', 'Santiago', 'IMV-0162'),
('SAN-F-3', 'Santo Ângelo', 'IMV-0163'),
('SAP-F-1', 'Santo Antônio da Patrulha', 'IMV-0164'),
('SAM-F-1', 'Santo Antônio das Missões', 'IMV-0165'),
('SAU-F-1', 'Santo Augusto', 'IMV-0166'),
('SAU-X-1', 'Santo Augusto (TERRENO)', 'IMV-0167'),
('SCR-F-1', 'Santo Cristo', 'IMV-0168'),
('SBO-F-1', 'São Borja', 'IMV-0169'),
('SFA-F-1', 'São Francisco de Assis', 'IMV-0170'),
('SFA-X-1', 'São Francisco de Assis (TERRENO)', 'IMV-0171'),
('SFP-F-1', 'São Francisco de Paula', 'IMV-0172'),
('SGA-F-1', 'São Gabriel', 'IMV-0173'),
('SJE-F-1', 'São Jerônimo', 'IMV-0174'),
('SJN-F-1', 'São José do Norte', 'IMV-0175'),
('SJO-F-1', 'São José do Ouro (Novo)', 'IMV-0176'),
('SLE-F-1', 'São Leopoldo', 'IMV-0177'),
('SLS-F-1', 'São Lourenço do Sul', 'IMV-0178'),
('SLG-F-1', 'São Luiz Gonzaga', 'IMV-0179'),
('SMA-F-3', 'São Marcos', 'IMV-0180'),
('SPS-F-1', 'São Pedro do Sul', 'IMV-0181'),
('SSC-F-1', 'São Sebastião do Caí', 'IMV-0182'),
('SSE-F-1', 'São Sepé (Antigo)', 'IMV-0183'),
('SSE-O-1', 'São Sepé (Novo)', 'IMV-0184'),
('SVA-F-1', 'São Valentim', 'IMV-0185'),
('SVS-F-1', 'São Vicente do Sul', 'IMV-0186'),
('SAP-F-2', 'Sapiranga', 'IMV-0187'),
('SSU-F-1', 'Sapucaia do Sul', 'IMV-0188'),
('SAR-F-1', 'Sarandi', 'IMV-0189'),
('SEB-F-1', 'Seberi', 'IMV-0190'),
('SOB-S-1', 'Sobradinho (2º pav. BB)', 'IMV-0191'),
('SOB-F-1', 'Sobradinho (Novo)', 'IMV-0192'),
('SOL-F-1', 'Soledade', 'IMV-0193'),
('TAP-F-1', 'Tapejara (Novo)', 'IMV-0194'),
('TAP-F-2', 'Tapera', 'IMV-0195'),
('TAP-F-3', 'Tapes', 'IMV-0196'),
('TAQ-F-1', 'Taquara', 'IMV-0197'),
('TAQ-F-2', 'Taquari', 'IMV-0198'),
('TPO-F-1', 'Tenente Portela', 'IMV-0199'),
('TAR-F-1', 'Terra de Areia', 'IMV-0200'),
('TEU-F-1', 'Teutônia', 'IMV-0201'),
('TOR-F-1', 'Torres', 'IMV-0202'),
('TRA-F-1', 'Tramandaí - Cível', 'IMV-0203'),
('TRA-F-2', 'Tramandaí - Criminal', 'IMV-0204'),
('TCO-F-1', 'Três Coroas', 'IMV-0205'),
('TMA-F-1', 'Três de Maio', 'IMV-0206'),
('TPA-F-1', 'Três Passos', 'IMV-0207'),
('TRI-F-1', 'Triunfo', 'IMV-0208'),
('TUC-F-1', 'Tucunduva', 'IMV-0209'),
('TUP-F-1', 'Tupanciretã', 'IMV-0210'),
('URU-F-1', 'Uruguaiana', 'IMV-0211'),
('VAC-F-1', 'Vacaria', 'IMV-0212'),
('VAI-F-1', 'Venâncio Aires', 'IMV-0213'),
('VCR-F-1', 'Vera Cruz', 'IMV-0214'),
('VER-F-1', 'Veranópolis', 'IMV-0215'),
('VIA-F-1', 'Viamão', 'IMV-0216'),
('VIA-F-2', 'Viamão (Anexo)', 'IMV-0217');
