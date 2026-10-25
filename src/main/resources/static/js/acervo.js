/* Acervo Técnico de Engenharia · regras e estado das telas (JavaScript puro) */
var EXTS = ['pdf', 'dwg', 'dxf', 'dwf', 'rvt', 'ifc', 'skp', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'kmz', 'zip'];
var TIPOS = {"PRA": "Prancha", "MEM": "Memorial descritivo", "MC": "Memória de cálculo", "ET": "Especificação técnica", "LIS": "Lista de materiais e quantitativos", "RDO": "Relatório diário de obra", "MED": "Medição", "CRO": "Cronograma", "TRB": "Termo de recebimento", "LAU": "Laudo", "REL": "Relatório técnico", "PT": "Parecer / nota técnica", "POP": "Procedimento", "PMN": "Plano de manutenção", "MAN": "Manual / catálogo técnico", "ART": "ART/RRT", "ORC": "Orçamento", "TR": "Termo de referência", "OS": "Ordem de serviço", "OF": "Ofício", "ATA": "Ata", "ALV": "Alvará / licença"};
var NATUREZA = {"PRA": "Projeto", "MEM": "Projeto", "MC": "Projeto", "ET": "Projeto", "LIS": "Projeto", "RDO": "Execução", "MED": "Execução", "CRO": "Execução", "TRB": "Execução", "LAU": "Manutenção e inspeção", "REL": "Manutenção e inspeção", "PT": "Manutenção e inspeção", "POP": "Manutenção e inspeção", "PMN": "Manutenção e inspeção", "MAN": "Manutenção e inspeção", "ART": "Administrativo", "ORC": "Administrativo", "TR": "Administrativo", "OS": "Administrativo", "OF": "Administrativo", "ATA": "Administrativo", "ALV": "Administrativo"};
var NATUREZAS = ["Projeto", "Execução", "Manutenção e inspeção", "Administrativo"];
var AREAS = {"ADM": "Administração", "CTR": "Contratos", "FIS": "Fiscalização", "MNT": "Manutenção", "OBR": "Obras", "OPR": "Operação", "PLA": "Planejamento", "PRO": "Projetos", "SEG": "Segurança"};
var DISCS = {"ARQ": "Arquitetura", "CIV": "Civil", "ELE": "Elétrica", "TEL": "Telecomunicações", "MEC": "Mecânica"};
var SISTEMAS = {"ARQ": {"EDI": "Projeto de edificação", "LAY": "Layout interno"}, "CIV": {"EST": "Estruturas", "OBR": "Obras civis", "GUT": "Vistoria"}, "ELE": {"ENE": "Energia e distribuição", "ILU": "Iluminação e tomadas", "SPDA": "SPDA"}, "TEL": {"LOG": "Rede lógica", "TEL": "Telefonia", "CFTV": "CFTV", "AV": "Áudio, vídeo e automação"}, "MEC": {"CLI": "Climatização", "ELE": "Elevadores", "GMG": "Gerador"}};
var SIS_DICA = {"ARQ": {"EDI": "plantas, cortes, elevações, fachadas, esquadrias, detalhamentos, paisagismo, restauro", "LAY": "mobiliário, divisórias, comunicação visual, acessibilidade"}, "CIV": {"EST": "fundações, contenções, topografia, sondagem, recuperação estrutural", "OBR": "alvenaria, pisos, forros, pintura, cobertura, impermeabilização, calçadas, muros", "GUT": "vistoria predial, matriz GUT, inspeção geral do prédio"}, "ELE": {"ENE": "entrada, subestação, no-break, quadros", "ILU": "circuitos de baixa tensão", "SPDA": "inclui aterramento"}, "TEL": {"LOG": "cabeamento, racks, wi-fi", "CFTV": "câmeras, gravadores, controle de acesso, alarme de intrusão", "AV": "salas de audiência, videoconferência, automação predial"}, "MEC": {"CLI": "ar-condicionado, ventilação, exaustão", "ELE": "inclui plataformas elevatórias", "GMG": "grupo motor-gerador, tanque de combustível, quadro de transferência"}};
var SIS_ORDEM = {"ARQ": ["EDI", "LAY"], "CIV": ["EST", "OBR", "GUT"], "ELE": ["ENE", "ILU", "SPDA"], "TEL": ["LOG", "TEL", "CFTV", "AV"], "MEC": ["CLI", "ELE", "GMG"]};
var FASE_AUTO = { 'Execução': 'OBR', 'Manutenção e inspeção': 'MAN', 'Administrativo': 'NA' };
function faseAuto(t) { return t ? (FASE_AUTO[NATUREZA[t]] || '') : ''; }
var TIPOS_REGISTRO = ['ATA', 'OF', 'ART', 'RDO', 'MED', 'ALV', 'TRB', 'OS'];
function statusPadrao(t) { return TIPOS_REGISTRO.indexOf(t) >= 0 ? 'Aprovado' : 'Em elaboração'; }
function nomeSis(d, k) { return (SISTEMAS[d] && SISTEMAS[d][k]) || k || ''; }
var FASES = {"EST": "Estudo Preliminar", "ANT": "Anteprojeto", "BAS": "Projeto Básico", "EXE": "Projeto Executivo", "OBR": "Obra", "ASB": "As Built", "MAN": "Uso e Manutenção", "NA": "Não se Aplica"};
var CONTATO_SIGILO = 'ao gestor do acervo técnico do DIPRED-DMAN';
var PALAVRAS_MINUSCULAS = ['a', 'o', 'as', 'os', 'e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'ou', 'à', 'ao'];
function tituloCaso(t) {
  return String(t || '').split(' ').map(function (w, i) {
    if (!w) return w;
    if (i > 0 && PALAVRAS_MINUSCULAS.indexOf(w.toLowerCase()) >= 0) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}
function nomePredio(cod) {
  var n = PREDIOS[cod] || cod || '';
  if (!cod || cod.indexOf('POA') === 0) return n;
  return 'Foro da Comarca de ' + n;
}
var USOS = { F: 'Foro', A: 'Administrativo', Q: 'Arquivo', O: 'Em obra', S: 'Sem uso', X: 'Terreno' };
var PREDIOS = {"AGU-F-1": "Agudo", "ALE-F-1": "Alegrete", "ALV-F-1": "Alvorada", "APR-F-1": "Antônio Prado", "AME-F-1": "Arroio do Meio", "ATI-F-1": "Arroio do Tigre", "AGR-F-1": "Arroio Grande", "ARV-F-1": "Arvorezinha", "APE-F-1": "Augusto Pestana", "BAG-F-1": "Bagé", "BRI-S-1": "Barra do Ribeiro (Antigo)", "BRI-F-1": "Barra do Ribeiro (Novo)", "BGO-F-1": "Bento Gonçalves", "BJE-F-1": "Bom Jesus", "BUT-F-1": "Butiá", "CSU-S-1": "Caçapava do Sul (Antigo)", "CSU-F-1": "Caçapava do Sul (Novo)", "CAC-F-1": "Cacequi", "CSU-F-2": "Cachoeira do Sul", "CAC-F-2": "Cachoeirinha", "CAM-F-1": "Camaquã", "CMI-F-1": "Campina das Missões", "CBO-F-1": "Campo Bom", "CNO-F-1": "Campo Novo", "CAN-S-1": "Candelária (2º pav. BB)", "CAN-F-1": "Candelária (Novo)", "CAN-F-2": "Canela", "CAN-F-3": "Canguçu", "CAN-F-4": "Canoas", "CCA-F-1": "Capão da Canoa (Novo)", "CAR-F-1": "Carazinho", "CBA-F-1": "Carlos Barbosa", "CAS-F-1": "Casca", "CAT-F-1": "Catuípe (Novo)", "CSU-F-3": "Caxias do Sul", "CLA-F-1": "Cerro Largo (Novo)", "CHA-F-1": "Charqueadas", "CON-F-1": "Constantina", "CBI-F-1": "Coronel Bicaco", "CRI-F-1": "Crissiumal", "CAL-F-1": "Cruz Alta", "DIR-F-1": "Dois Irmãos", "DPE-F-1": "Dom Pedrito", "ESU-X-1": "Eldorado do Sul (DARQ) (TERRENO)", "ESU-F-1": "Eldorado do Sul (Novo)", "ENC-F-1": "Encantado", "ESU-F-2": "Encruzilhada do Sul", "ERE-F-1": "Erechim", "ESP-F-1": "Espumoso (Novo)", "EVE-F-1": "Estância Velha", "EST-F-1": "Esteio", "EST-O-1": "Esteio (Novo)", "EST-F-2": "Estrela", "FAR-F-1": "Farroupilha", "FSO-S-1": "Faxinal do Soturno (2º andar BB)", "FSO-F-1": "Faxinal do Soturno (Novo)", "FEL-F-1": "Feliz", "FCU-F-1": "Flores da Cunha", "FWE-F-1": "Frederico Westphalen", "GAR-F-1": "Garibaldi", "GAU-S-1": "Gaurama (Antigo)", "GAU-F-1": "Gaurama (Novo)", "GCA-F-1": "General Câmara", "GVA-F-1": "Getúlio Vargas", "GIR-F-1": "Giruá", "GRA-F-1": "Gramado", "GRA-F-2": "Gravataí", "GUA-F-1": "Guaíba", "GUA-F-2": "Guaporé", "GMI-F-1": "Guarani das Missões", "HER-F-1": "Herval", "HER-X-1": "Herval (TERRENO)", "HOR-F-1": "Horizontina", "IBI-F-1": "Ibirubá", "IGR-F-1": "Igrejinha", "IJU-F-1": "Ijuí", "IRA-F-1": "Iraí", "ITA-F-1": "Itaqui", "IVO-F-1": "Ivoti", "JAG-F-1": "Jaguarão", "JAG-S-1": "Jaguari (2º pav. BB)", "JAG-F-2": "Jaguari (Novo)", "JCA-S-1": "Júlio de Castilhos (Antigo)", "JCA-F-1": "Júlio de Castilhos (Novo)", "LVE-F-1": "Lagoa Vermelha", "LAJ-F-1": "Lajeado", "LSU-F-1": "Lavras do Sul", "MAR-F-1": "Marau", "MAR-X-1": "Marau (TERRENO)", "MRA-F-1": "Marcelino Ramos", "MON-F-1": "Montenegro", "MOS-F-1": "Mostardas", "NMT-F-1": "Não-Me-Toque", "NON-F-1": "Nonoai", "NPE-F-1": "Nova Petrópolis", "NPR-F-1": "Nova Prata", "NHA-F-1": "Novo Hamburgo", "OSO-F-1": "Osório", "PSU-F-1": "Palmares do Sul", "PMI-F-1": "Palmeira das Missões", "PMI-X-1": "Palmeira das Missões (TERRENO)", "PAN-F-1": "Panambi", "PAR-F-1": "Parobé", "PFU-F-1": "Passo Fundo (Criminal)", "PFU-F-2": "Passo Fundo (Cível)", "PFU-F-3": "Passo Fundo - 4ª Auditoria Militar", "POS-F-1": "Pedro Osório", "PEL-F-1": "Pelotas", "PMA-F-1": "Pinheiro Machado", "PIR-F-1": "Piratini (2º pav. BB)", "PLA-F-1": "Planalto", "POR-F-1": "Portão", "POA-Q-1": "Porto Alegre - DARQ A (Administrativo)", "POA-Q-2": "Porto Alegre - DARQ B", "POA-A-1": "Porto Alegre - Ed. Glicério Alves", "POA-Q-3": "Porto Alegre - Arquivo Judicial - Assis Brasil", "POA-Q-4": "Porto Alegre - Arquivo Judicial - AERO I", "POA-Q-5": "Porto Alegre - Arquivo Judicial - AERO II", "POA-Q-6": "Porto Alegre - Depósito Judicial - Navegantes", "POA-A-2": "Porto Alegre - CJUD", "POA-A-3": "Porto Alegre - CIACA", "POA-Q-7": "Porto Alegre - Departamento de Artes Gráficas", "POA-A-4": "Porto Alegre - Departamento de Material e Patrimônio - Tenente Ary Tarragô", "POA-A-5": "Porto Alegre - Departamento de Material e Patrimônio - Madre Maria Selima", "POA-A-6": "Porto Alegre - Equipe de transportes", "POA-F-1": "Porto Alegre - Foro Central - Prédio 1", "POA-F-2": "Porto Alegre - Antiga Creche", "POA-F-3": "Porto Alegre - Foro Central - Prédio 2", "POA-F-4": "Porto Alegre - Central de Justiça (TERRENO)", "POA-F-5": "Porto Alegre - Foro Regional da Restinga", "POA-X-1": "Porto Alegre - Foro Regional da Restinga (TERRENO)", "POA-F-6": "Porto Alegre - Foro Regional da Tristeza", "POA-F-7": "Porto Alegre - Foro Regional do Alto Petrópolis", "POA-F-8": "Porto Alegre - Foro Regional do Partenon", "POA-F-9": "Porto Alegre - Foro Regional do Sarandi", "POA-A-7": "Porto Alegre - NUGESP (Novo)", "POA-A-8": "Porto Alegre - Palácio da Justiça", "POA-A-9": "Porto Alegre - Tribunal de Justiça", "POA-A-10": "Porto Alegre - Tribunal de Justiça (Anexo)", "POA-A-11": "Porto Alegre - Tribunal de Justiça Militar", "POA-A-12": "Porto Alegre - 2ª Auditoria Militar", "POA-A-13": "Porto Alegre - Aeroporto", "POA-A-14": "Porto Alegre - Estádio Arena", "POA-A-15": "Porto Alegre - Estádio Beira Rio", "PXA-F-1": "Porto Xavier", "QUA-F-1": "Quaraí", "RSE-F-1": "Restinga Seca", "RGR-F-1": "Rio Grande (Novo)", "RPA-F-1": "Rio Pardo", "RBO-F-1": "Rodeio Bonito", "RAL-F-1": "Ronda Alta", "RSU-F-1": "Rosário do Sul", "SJA-F-1": "Salto do Jacuí", "SAN-F-1": "Sananduva", "SBS-F-1": "Santa Bárbara do Sul", "SCS-F-1": "Santa Cruz do Sul", "SMA-F-1": "Santa Maria - Alameda Buenos Aires 201", "SMA-F-2": "Santa Maria - Alameda Buenos Aires 97", "SRO-F-1": "Santa Rosa", "SVP-F-1": "Santa Vitória do Palmar", "SLI-F-1": "Santana do Livramento", "SAN-F-2": "Santiago", "SAN-F-3": "Santo Ângelo", "SAP-F-1": "Santo Antônio da Patrulha", "SAM-F-1": "Santo Antônio das Missões", "SAU-F-1": "Santo Augusto", "SAU-X-1": "Santo Augusto (TERRENO)", "SCR-F-1": "Santo Cristo", "SBO-F-1": "São Borja", "SFA-F-1": "São Francisco de Assis", "SFA-X-1": "São Francisco de Assis (TERRENO)", "SFP-F-1": "São Francisco de Paula", "SGA-F-1": "São Gabriel", "SJE-F-1": "São Jerônimo", "SJN-F-1": "São José do Norte", "SJO-F-1": "São José do Ouro (Novo)", "SLE-F-1": "São Leopoldo", "SLS-F-1": "São Lourenço do Sul", "SLG-F-1": "São Luiz Gonzaga", "SMA-F-3": "São Marcos", "SPS-F-1": "São Pedro do Sul", "SSC-F-1": "São Sebastião do Caí", "SSE-F-1": "São Sepé (Antigo)", "SSE-O-1": "São Sepé (Novo)", "SVA-F-1": "São Valentim", "SVS-F-1": "São Vicente do Sul", "SAP-F-2": "Sapiranga", "SSU-F-1": "Sapucaia do Sul", "SAR-F-1": "Sarandi", "SEB-F-1": "Seberi", "SOB-S-1": "Sobradinho (2º pav. BB)", "SOB-F-1": "Sobradinho (Novo)", "SOL-F-1": "Soledade", "TAP-F-1": "Tapejara (Novo)", "TAP-F-2": "Tapera", "TAP-F-3": "Tapes", "TAQ-F-1": "Taquara", "TAQ-F-2": "Taquari", "TPO-F-1": "Tenente Portela", "TAR-F-1": "Terra de Areia", "TEU-F-1": "Teutônia", "TOR-F-1": "Torres", "TRA-F-1": "Tramandaí - Cível", "TRA-F-2": "Tramandaí - Criminal", "TCO-F-1": "Três Coroas", "TMA-F-1": "Três de Maio", "TPA-F-1": "Três Passos", "TRI-F-1": "Triunfo", "TUC-F-1": "Tucunduva", "TUP-F-1": "Tupanciretã", "URU-F-1": "Uruguaiana", "VAC-F-1": "Vacaria", "VAI-F-1": "Venâncio Aires", "VCR-F-1": "Vera Cruz", "VER-F-1": "Veranópolis", "VIA-F-1": "Viamão", "VIA-F-2": "Viamão (Anexo)"};
var PREDIO_ID = {"AGU-F-1": "IMV-0001", "ALE-F-1": "IMV-0002", "ALV-F-1": "IMV-0003", "APR-F-1": "IMV-0004", "AME-F-1": "IMV-0005", "ATI-F-1": "IMV-0006", "AGR-F-1": "IMV-0007", "ARV-F-1": "IMV-0008", "APE-F-1": "IMV-0009", "BAG-F-1": "IMV-0010", "BRI-S-1": "IMV-0011", "BRI-F-1": "IMV-0012", "BGO-F-1": "IMV-0013", "BJE-F-1": "IMV-0014", "BUT-F-1": "IMV-0015", "CSU-S-1": "IMV-0016", "CSU-F-1": "IMV-0017", "CAC-F-1": "IMV-0018", "CSU-F-2": "IMV-0019", "CAC-F-2": "IMV-0020", "CAM-F-1": "IMV-0021", "CMI-F-1": "IMV-0022", "CBO-F-1": "IMV-0023", "CNO-F-1": "IMV-0024", "CAN-S-1": "IMV-0025", "CAN-F-1": "IMV-0026", "CAN-F-2": "IMV-0027", "CAN-F-3": "IMV-0028", "CAN-F-4": "IMV-0029", "CCA-F-1": "IMV-0030", "CAR-F-1": "IMV-0031", "CBA-F-1": "IMV-0032", "CAS-F-1": "IMV-0033", "CAT-F-1": "IMV-0034", "CSU-F-3": "IMV-0035", "CLA-F-1": "IMV-0036", "CHA-F-1": "IMV-0037", "CON-F-1": "IMV-0038", "CBI-F-1": "IMV-0039", "CRI-F-1": "IMV-0040", "CAL-F-1": "IMV-0041", "DIR-F-1": "IMV-0042", "DPE-F-1": "IMV-0043", "ESU-X-1": "IMV-0044", "ESU-F-1": "IMV-0045", "ENC-F-1": "IMV-0046", "ESU-F-2": "IMV-0047", "ERE-F-1": "IMV-0048", "ESP-F-1": "IMV-0049", "EVE-F-1": "IMV-0050", "EST-F-1": "IMV-0051", "EST-O-1": "IMV-0052", "EST-F-2": "IMV-0053", "FAR-F-1": "IMV-0054", "FSO-S-1": "IMV-0055", "FSO-F-1": "IMV-0056", "FEL-F-1": "IMV-0057", "FCU-F-1": "IMV-0058", "FWE-F-1": "IMV-0059", "GAR-F-1": "IMV-0060", "GAU-S-1": "IMV-0061", "GAU-F-1": "IMV-0062", "GCA-F-1": "IMV-0063", "GVA-F-1": "IMV-0064", "GIR-F-1": "IMV-0065", "GRA-F-1": "IMV-0066", "GRA-F-2": "IMV-0067", "GUA-F-1": "IMV-0068", "GUA-F-2": "IMV-0069", "GMI-F-1": "IMV-0070", "HER-F-1": "IMV-0071", "HER-X-1": "IMV-0072", "HOR-F-1": "IMV-0073", "IBI-F-1": "IMV-0074", "IGR-F-1": "IMV-0075", "IJU-F-1": "IMV-0076", "IRA-F-1": "IMV-0077", "ITA-F-1": "IMV-0078", "IVO-F-1": "IMV-0079", "JAG-F-1": "IMV-0080", "JAG-S-1": "IMV-0081", "JAG-F-2": "IMV-0082", "JCA-S-1": "IMV-0083", "JCA-F-1": "IMV-0084", "LVE-F-1": "IMV-0085", "LAJ-F-1": "IMV-0086", "LSU-F-1": "IMV-0087", "MAR-F-1": "IMV-0088", "MAR-X-1": "IMV-0089", "MRA-F-1": "IMV-0090", "MON-F-1": "IMV-0091", "MOS-F-1": "IMV-0092", "NMT-F-1": "IMV-0093", "NON-F-1": "IMV-0094", "NPE-F-1": "IMV-0095", "NPR-F-1": "IMV-0096", "NHA-F-1": "IMV-0097", "OSO-F-1": "IMV-0098", "PSU-F-1": "IMV-0099", "PMI-F-1": "IMV-0100", "PMI-X-1": "IMV-0101", "PAN-F-1": "IMV-0102", "PAR-F-1": "IMV-0103", "PFU-F-1": "IMV-0104", "PFU-F-2": "IMV-0105", "PFU-F-3": "IMV-0106", "POS-F-1": "IMV-0107", "PEL-F-1": "IMV-0108", "PMA-F-1": "IMV-0109", "PIR-F-1": "IMV-0110", "PLA-F-1": "IMV-0111", "POR-F-1": "IMV-0112", "POA-Q-1": "IMV-0113", "POA-Q-2": "IMV-0114", "POA-A-1": "IMV-0115", "POA-Q-3": "IMV-0116", "POA-Q-4": "IMV-0117", "POA-Q-5": "IMV-0118", "POA-Q-6": "IMV-0119", "POA-A-2": "IMV-0120", "POA-A-3": "IMV-0121", "POA-Q-7": "IMV-0122", "POA-A-4": "IMV-0123", "POA-A-5": "IMV-0124", "POA-A-6": "IMV-0125", "POA-F-1": "IMV-0126", "POA-F-2": "IMV-0127", "POA-F-3": "IMV-0128", "POA-F-4": "IMV-0129", "POA-F-5": "IMV-0130", "POA-X-1": "IMV-0131", "POA-F-6": "IMV-0132", "POA-F-7": "IMV-0133", "POA-F-8": "IMV-0134", "POA-F-9": "IMV-0135", "POA-A-7": "IMV-0136", "POA-A-8": "IMV-0137", "POA-A-9": "IMV-0138", "POA-A-10": "IMV-0139", "POA-A-11": "IMV-0140", "POA-A-12": "IMV-0141", "POA-A-13": "IMV-0142", "POA-A-14": "IMV-0143", "POA-A-15": "IMV-0144", "PXA-F-1": "IMV-0145", "QUA-F-1": "IMV-0146", "RSE-F-1": "IMV-0147", "RGR-F-1": "IMV-0148", "RPA-F-1": "IMV-0149", "RBO-F-1": "IMV-0150", "RAL-F-1": "IMV-0151", "RSU-F-1": "IMV-0152", "SJA-F-1": "IMV-0153", "SAN-F-1": "IMV-0154", "SBS-F-1": "IMV-0155", "SCS-F-1": "IMV-0156", "SMA-F-1": "IMV-0157", "SMA-F-2": "IMV-0158", "SRO-F-1": "IMV-0159", "SVP-F-1": "IMV-0160", "SLI-F-1": "IMV-0161", "SAN-F-2": "IMV-0162", "SAN-F-3": "IMV-0163", "SAP-F-1": "IMV-0164", "SAM-F-1": "IMV-0165", "SAU-F-1": "IMV-0166", "SAU-X-1": "IMV-0167", "SCR-F-1": "IMV-0168", "SBO-F-1": "IMV-0169", "SFA-F-1": "IMV-0170", "SFA-X-1": "IMV-0171", "SFP-F-1": "IMV-0172", "SGA-F-1": "IMV-0173", "SJE-F-1": "IMV-0174", "SJN-F-1": "IMV-0175", "SJO-F-1": "IMV-0176", "SLE-F-1": "IMV-0177", "SLS-F-1": "IMV-0178", "SLG-F-1": "IMV-0179", "SMA-F-3": "IMV-0180", "SPS-F-1": "IMV-0181", "SSC-F-1": "IMV-0182", "SSE-F-1": "IMV-0183", "SSE-O-1": "IMV-0184", "SVA-F-1": "IMV-0185", "SVS-F-1": "IMV-0186", "SAP-F-2": "IMV-0187", "SSU-F-1": "IMV-0188", "SAR-F-1": "IMV-0189", "SEB-F-1": "IMV-0190", "SOB-S-1": "IMV-0191", "SOB-F-1": "IMV-0192", "SOL-F-1": "IMV-0193", "TAP-F-1": "IMV-0194", "TAP-F-2": "IMV-0195", "TAP-F-3": "IMV-0196", "TAQ-F-1": "IMV-0197", "TAQ-F-2": "IMV-0198", "TPO-F-1": "IMV-0199", "TAR-F-1": "IMV-0200", "TEU-F-1": "IMV-0201", "TOR-F-1": "IMV-0202", "TRA-F-1": "IMV-0203", "TRA-F-2": "IMV-0204", "TCO-F-1": "IMV-0205", "TMA-F-1": "IMV-0206", "TPA-F-1": "IMV-0207", "TRI-F-1": "IMV-0208", "TUC-F-1": "IMV-0209", "TUP-F-1": "IMV-0210", "URU-F-1": "IMV-0211", "VAC-F-1": "IMV-0212", "VAI-F-1": "IMV-0213", "VCR-F-1": "IMV-0214", "VER-F-1": "IMV-0215", "VIA-F-1": "IMV-0216", "VIA-F-2": "IMV-0217"};
function isoBR(t) { var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t || ''); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; }
function tsBR(t) { var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t || ''); return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0; }
function semAcento(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
var PREDIO_LISTA = Object.keys(PREDIOS).map(function (k) { return { cod: k, nome: PREDIOS[k], chave: semAcento(PREDIOS[k] + ' ' + k) }; })
  .sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });

var STATUS_ORDEM = ['Em elaboração', 'Aprovado', 'Cancelado'];
var STATUS_NOMES = {};
STATUS_ORDEM.forEach(function (x) { STATUS_NOMES[x] = x; });
var STATUS_COR = {
  'Em elaboração': ['#F1F3F6', '#4B5563', '#97A0AC'],
  'Aprovado': ['#E7F6EE', '#17643A', '#2E9E5B'],
  'Substituído': ['#F2F4F7', '#667080', '#B2BAC4'],
  'Cancelado': ['#F2F4F7', '#667080', '#B2BAC4']
};
var EXT_COR = {
  pdf: ['#FDECEC', '#B42318'], dwg: ['#EAF2FC', '#1F5AA6'], dxf: ['#EAF2FC', '#1F5AA6'],
  doc: ['#ECEFFB', '#2E47A1'], docx: ['#ECEFFB', '#2E47A1'], xls: ['#E7F6EE', '#17643A'], xlsx: ['#E7F6EE', '#17643A'],
  jpg: ['#F3F0FC', '#5B3FA8'], jpeg: ['#F3F0FC', '#5B3FA8'], png: ['#F3F0FC', '#5B3FA8'], tif: ['#F3F0FC', '#5B3FA8'], tiff: ['#F3F0FC', '#5B3FA8'],
  dwf: ['#EAF2FC', '#1F5AA6'], rvt: ['#E6F4F7', '#0E6378'], ifc: ['#E6F4F7', '#0E6378'], skp: ['#E6F4F7', '#0E6378'], kmz: ['#E7F6EE', '#17643A']
};
var FILTROS = [
  { k: 'fPredio', campo: 'predio' },
  { k: 'fStatus', campo: 'status', titulo: 'Status', nomes: STATUS_NOMES, fixo: true, limite: 99, rotuloChip: 'Status' },
  { k: 'fDisc', campo: 'disc', titulo: 'Disciplina', nomes: DISCS, limite: 6, rotuloChip: 'Disciplina' },
  { k: 'fTipo', campo: 'tipo', titulo: 'Tipo de Documento', nomes: TIPOS, limite: 6, rotuloChip: 'Tipo' },
  { k: 'fSis', campo: 'sisK', titulo: 'Assunto', nomes: {}, limite: 5, rotuloChip: 'Assunto' }
];
var COLS = '80px minmax(0, 2.2fr) minmax(0, 1.5fr) minmax(0, 1.6fr) 44px 176px 92px';
var GRID = 'display: grid; grid-template-columns: ' + COLS + '; gap: 14px; align-items: center;';
var GRID_CAB = 'display: grid; grid-template-columns: ' + COLS + ' 84px; gap: 14px; align-items: center;';
var MARCA = 'background: #FFE9A8; color: #1F2937; border-radius: 2px; box-shadow: 0 0 0 1px #FFE9A8;';
/* divide o texto em trechos, marcando o que casou com a pesquisa (sem diferenciar acentos) */
function partes(texto, tokens) {
  texto = String(texto || '');
  if (!tokens.length || !texto) return [{ t: texto, estilo: '' }];
  var norm = '', mapa = [];
  for (var i = 0; i < texto.length; i++) { var n = semAcento(texto[i]); for (var j = 0; j < n.length; j++) { norm += n[j]; mapa.push(i); } }
  var marca = [];
  tokens.forEach(function (tk) {
    var p = norm.indexOf(tk);
    while (p >= 0 && tk) { for (var q = p; q < p + tk.length; q++) marca[mapa[q]] = true; p = norm.indexOf(tk, p + tk.length); }
  });
  var out = [], atual = null;
  for (var k = 0; k < texto.length; k++) {
    var m = !!marca[k];
    if (!atual || atual.m !== m) { atual = { m: m, t: '' }; out.push(atual); }
    atual.t += texto[k];
  }
  return out.map(function (x) { return { t: x.t, estilo: x.m ? MARCA : '' }; });
}
var PASTAS_DISC = { ARQ: 'ARQUITETURA', CIV: 'CIVIL', ELE: 'ELETRICA', HID: 'HIDRAULICA', INC: 'PPCI', TEL: 'TELECOM', MEC: 'CLIMATIZACAO', MUL: 'GERAL' };
var PASTAS_DISC_OLD = { ARQ: 'ARQUITETURA', ELE: 'ELETRICA', HID: 'HIDRAULICA', CLI: 'CLIMATIZACAO', INC: 'PPCI', SDA: 'PPCI', LOG: 'REDE LOGICA', EST: 'ESTRUTURAL', CIV: 'CIVIL', SPDA: 'SPDA', CFT: 'SEGURANCA', GER: 'GERAL', TOP: 'TOPOGRAFIA', GEO: 'SONDAGEM', AUT: 'AUTOMACAO', MEC: 'MECANICA', GAS: 'GASES', TEL: 'TELEFONIA', ORC: 'ORCAMENTOS' };
var ORDEM_TEXTO = {
  data: ['mais antigos primeiro', 'mais recentes primeiro'], disc: ['disciplina de A a Z', 'disciplina de Z a A'], seq: ['sequencial crescente', 'sequencial decrescente'],
  doc: ['documento de A a Z', 'documento de Z a A'], predio: ['prédio de A a Z', 'prédio de Z a A'],
  status: ['status na ordem do fluxo', 'status na ordem inversa do fluxo']
};

function gerarAcervo() {
  var a = 20261014;
  var rnd = function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  var pick = function (arr) { return arr[Math.floor(rnd() * arr.length)]; };
  var combos = [['PRO','ARQ','PL'],['PRO','ARQ','PL'],['PRO','ARQ','DET'],['PRO','ARQ','MEM'],['PRO','ARQ','ART'],['PRO','ARQ','ASB'],['PRO','ELE','PL'],['PRO','ELE','PL'],['PRO','ELE','UNI'],['PRO','ELE','MC'],['PRO','ELE','ART'],['PRO','ELE','ASB'],['PRO','HID','PL'],['PRO','HID','MC'],['PRO','CLI','MEM'],['PRO','CLI','PL'],['PRO','INC','PL'],['PRO','SDA','PL'],['PRO','LOG','PL'],['PRO','LOG','LIS'],['PRO','EST','PL'],['PRO','EST','MC'],['PRO','GER','ET'],['PRO','GER','ORC'],['PRO','TOP','MAP'],['PRO','GEO','LAU'],['PRO','AUT','DIA'],['PRO','MEC','ET'],['PRO','GAS','PL'],['PRO','TEL','PL'],['MNT','SPDA','LAU'],['MNT','ELE','LAU'],['MNT','CLI','REL'],['MNT','HID','REL'],['MNT','CIV','LAU'],['OBR','CIV','RDO'],['OBR','GER','MED'],['OBR','GER','CRO'],['OBR','ARQ','ASB'],['FIS','CIV','REL'],['FIS','GER','PT'],['FIS','ELE','NT'],['SEG','CFT','PL'],['SEG','SDA','PL'],['PLA','GER','TR'],['CTR','GER','OS'],['ADM','GER','OF'],['OPR','ELE','POP'],['OPR','CLI','POP'],['PRO','GER','ATA']];
  var desenho = { PRA: 1 };
  var planilha = { ORC: 1, MED: 1, LIS: 1, CRO: 1 };
  var finais = ['Aprovado', 'Aprovado', 'Aprovado', 'Aprovado', 'Aprovado', 'Aprovado', 'Em elaboração', 'Em elaboração', 'Cancelado'];
  var ambientes = ['Térreo', '1º pavimento', '2º pavimento', '3º pavimento', 'Subsolo', 'Cobertura', 'Ala norte', 'Ala sul', 'Sala do júri', 'Cartórios', 'Arquivo', 'Fachada principal', 'Estacionamento', 'Casa de máquinas'];
  var objetos = {
    ELE: ['quadro de distribuição geral', 'iluminação e tomadas', 'entrada de energia e medição', 'circuitos do ar-condicionado', 'gerador e QTA'],
    ARQ: ['layout de mobiliário', 'reforma dos sanitários PNE', 'planta de forro', 'acessibilidade e rampas', 'paginação de piso'],
    HID: ['reservatório superior', 'rede de esgoto', 'drenagem pluvial', 'sanitários'],
    CLI: ['VRF das salas de audiência', 'exaustão dos sanitários', 'splits do arquivo'],
    INC: ['hidrantes e extintores', 'rotas de fuga e sinalização'], SDA: ['detectores e acionadores', 'central de alarme'],
    LOG: ['rack e pontos de rede', 'cabeamento das salas'], EST: ['reforço de laje', 'fundações do anexo', 'cobertura metálica'],
    SPDA: ['captores e descidas', 'malha de aterramento'], CFT: ['câmeras do perímetro'], CIV: ['impermeabilização', 'fissuras na fachada', 'recuperação estrutural'],
    GER: ['reforma geral', 'adequação de layout', 'manutenção predial anual', 'orçamento da reforma']
  };
  var atualiz = ['ajuste conforme vistoria', 'compatibilização com climatização', 'inclusão de novos circuitos', 'correção de cotas', 'atendimento às ressalvas da fiscalização'];
  var cods = Object.keys(PREDIOS);
  var poa = cods.filter(function (c) { return c.indexOf('POA') === 0; });
  var docs = [];
  var inicio = new Date(2017, 0, 1).getTime();
  var fim = new Date(2026, 9, 10).getTime();
  for (var seq = 1; seq <= 8; seq++) {
    var DG = ['ELE', 'ELE', 'ELE', 'ELE', 'ARQ', 'ARQ', 'ARQ', 'TEL', 'TEL', 'TEL', 'CIV', 'CIV', 'CIV', 'MEC', 'MEC'];
    var TG = ['PRA', 'PRA', 'PRA', 'PRA', 'PRA', 'PRA', 'MEM', 'MEM', 'MC', 'ET', 'LIS', 'LAU', 'LAU', 'REL', 'REL', 'PT', 'POP', 'PMN', 'MAN', 'ART', 'ART', 'ORC', 'TR', 'OS', 'RDO', 'MED', 'CRO', 'TRB', 'ALV', 'PT', 'OF', 'ATA'];
    var dsc = pick(DG);
    var c = [pick(SIS_ORDEM[dsc]), dsc, pick(TG)];
    var FIXOS = { 2: ['OBR', 'CIV', 'RDO'], 5: ['CLI', 'MEC', 'ART'], 8: ['GUT', 'CIV', 'REL'] };
    if (FIXOS[seq]) c = FIXOS[seq];
    var predio = rnd() < 0.3 ? pick(poa) : pick(cods);
    if (seq % 23 === 7) {
      c = [['ILU', 'ELE', 'PRA'], ['ENE', 'ELE', 'PRA'], ['LAY', 'ARQ', 'PRA'], ['EDI', 'ARQ', 'PRA']][seq % 4];
      predio = ['CSU-F-3', 'PEL-F-1', 'POA-F-1', 'SMA-F-1', 'CAN-F-4'][Math.floor(seq / 23) % 5];
    }
    var nRev = 1 + (rnd() < 0.4 ? 1 : 0) + (rnd() < 0.15 ? 1 : 0) + (rnd() < 0.05 ? 1 : 0);
    var t = inicio + rnd() * (fim - inicio - 1000 * 3600 * 24 * 200);
    var acesso = rnd() < 0.18 ? 'Público' : (rnd() < 0.02 ? 'Informação classificada' : 'Acesso controlado');
    if (seq === 6) acesso = 'Informação classificada';
    var fase = faseAuto(c[2]) || pick(['EXE', 'EXE', 'BAS', 'ANT', 'EST', 'ASB']);
    var sei = rnd() < 0.45 ? '8.' + (2017 + (seq % 10)) + '.0010/' + String(1000 + Math.floor(rnd() * 98000)).padStart(6, '0') + '-' + Math.floor(rnd() * 10) : '';
    var imp = false;
    var objLista = c[0] !== 'VAR' ? [nomeSis(c[1], c[0]).toLowerCase()] : (objetos[c[1]] || objetos.GER);
    var resp = rnd() < 0.5 ? String(100000 + Math.floor(rnd() * 900000)) : '';
    var comBase = rnd() < 0.7 ? pick(ambientes) + ': ' + objLista[seq % objLista.length] : '';
    for (var r = 0; r < nRev; r++) {
      t += rnd() * 1000 * 3600 * 24 * 60;
      var ultimaRev = r === nRev - 1;
      var status = ultimaRev ? (c[2] === 'ASB' ? 'Aprovado' : pick(finais)) : 'Substituído';
      var exts = desenho[c[1] === 'ELE' && c[2] === 'MC' ? 'X' : c[2]] ? [rnd() < 0.55 ? 'pdf' : 'dwg'] : (planilha[c[2]] ? ['xlsx'] : [rnd() < 0.8 ? 'pdf' : 'docx']);
      var dt = new Date(Math.min(t, fim));
      var com = r > 0 && comBase && rnd() < 0.6 ? comBase + '. ' + pick(atualiz).replace(/^./, function (x) { return x.toUpperCase(); }) + '.' : comBase;
      exts.forEach(function (ext) {
        docs.push({
          seq: seq, rev: r, predio: predio, sis: c[0], disc: c[1], tipo: c[2], fase: fase, status: status,
          acesso: acesso, sigilo: acesso === 'Informação classificada' ? 'Reservada' : 'Não se aplica',
          ext: ext, size: Math.round((ext === 'dwg' ? 900000 : 120000) + rnd() * 3200000),
          ts: dt.getTime(), data: String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear(),
          por: 'Carga inicial', url: '', comentario: com,
          ticket: resp, sei: sei
        });
      });
    }
  }
  /* quando a última revisão não está aprovada, a anterior continua valendo */
  var porSeq = {};
  docs.forEach(function (x) { (porSeq[x.seq] = porSeq[x.seq] || []).push(x); });
  Object.keys(porSeq).forEach(function (k) {
    var l = porSeq[k].sort(function (a, b) { return a.rev - b.rev; });
    var u = l[l.length - 1];
    if (TIPOS_REGISTRO.indexOf(u.tipo) >= 0 && u.status === 'Em elaboração') u.status = 'Aprovado';
    if (l.length > 1 && u.status !== 'Aprovado') l[l.length - 2].status = 'Aprovado';
  });
  return docs;
}

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.timer = null;
    this._ref = null;
    this.state = Object.assign(this.formLimpo(), {
      busca: '', fPredio: [], pop: null, popBusca: '',
      fStatus: [], fDisc: [], fTipo: [], fSis: [], mais: {},
      ordem: 'data', direcao: 'desc', pag: 1, porPagina: 25, alturaLinha: 62,
      ver: null, verRev: null, form: null, edicao: null, edDet: null, verAlt: false, justificativa: '', avisoEd: '', info: false, sucesso: null, sel: null,
      login: false, menuConta: false, usuario: '', perfil: 'tecnico',
      loginUsuario: '', loginSenha: '', loginPerfil: 'tecnico', loginErro: '',
      toast: '', destaque: null, hist: {},
      nextSeq: 9,
      recentes: [],
      docs: gerarAcervo()
    }, this.lerEndereco());
  }

  /* pesquisa, filtros e documento aberto ficam no endereço da página, para compartilhar por link */
  lerEndereco() {
    var o = {};
    try {
      var q = new URLSearchParams(window.location.search);
      var lista = (k) => (q.get(k) ? q.get(k).split(',').filter(Boolean) : null);
      if (q.get('q')) o.busca = q.get('q');
      [['predio', 'fPredio'], ['status', 'fStatus'], ['disc', 'fDisc'], ['tipo', 'fTipo'], ['sis', 'fSis']].forEach((x) => { var v = lista(x[0]); if (v) o[x[1]] = v; });
      if (q.get('doc') && /^\d+$/.test(q.get('doc'))) { o.ver = parseInt(q.get('doc'), 10); o.sel = o.ver; }
    } catch (e) {}
    return o;
  }

  consulta(s, comDoc) {
    var q = [];
    var add = (k, v) => { if (v) q.push(k + '=' + encodeURIComponent(v)); };
    add('q', s.busca.trim());
    add('predio', s.fPredio.join(',')); add('status', s.fStatus.join(',')); add('disc', s.fDisc.join(','));
    add('tipo', s.fTipo.join(',')); add('sis', s.fSis.join(','));
    if (comDoc != null) q.push('doc=' + this.pad(comDoc));
    return q.join('&').replace(/%2C/g, ',');
  }

  linkPara(qs) {
    var base = 'acervo';
    try { if (/^https?:/.test(window.location.protocol)) base = window.location.origin + window.location.pathname; } catch (e) {}
    return base + (qs ? '?' + qs : '');
  }

  sincronizarEndereco(qs) {
    if (qs === this._qs) return;
    this._qs = qs;
    setTimeout(() => {
      try { window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash); } catch (e) {}
    }, 0);
  }

  /* quantidade de linhas por página = o que cabe na caixa da lista (sem rolagem da página) */
  componentDidMount() {
    this._medir = () => {
      var el = document.querySelector('[data-l="rolagem"]');
      if (!el) return;
      var n = 25, h = 62;
      if (window.innerWidth >= 900 && window.innerHeight >= 560) {
        var util = el.clientHeight - 45;
        n = Math.max(4, Math.min(10, Math.floor(util / 44)), Math.floor(util / 58));
        h = Math.floor((util / n) * 100) / 100;
      }
      if (n !== this.state.porPagina || h !== this.state.alturaLinha) this.setState({ porPagina: n, alturaLinha: h });
    };
    window.addEventListener('resize', this._medir);
    try {
      this._ro = new ResizeObserver(() => this._medir());
      var el = document.querySelector('[data-l="rolagem"]');
      if (el) this._ro.observe(el);
    } catch (e) { this._ro = null; }
    this._t0 = setTimeout(this._medir, 60);
    this._tecla = (e) => this.teclaGlobal(e);
    document.addEventListener('keydown', this._tecla);
  }

  modalAberto() {
    var s = this.state;
    return s.ver != null || !!s.form || !!s.sucesso || !!s.edicao || s.login || s.info || !!s.sigilo || !!s.exclusao || s.lixeira || !!s.pop || s.menuConta;
  }

  /* atalhos: / pesquisa · setas navegam · Enter abre · ← → trocam de página · Esc fecha */
  teclaGlobal(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    var s = this.state;
    if (this.modalAberto()) { if (e.key === 'Escape') { e.preventDefault(); this.fecharTopo(); } return; }
    var alvo = e.target || {};
    var tag = alvo.tagName || '';
    var naBusca = alvo.id === 'ac-busca';
    var digitando = /INPUT|TEXTAREA|SELECT/.test(tag);
    if (e.key === '/' && !digitando) { e.preventDefault(); var b = document.getElementById('ac-busca'); if (b) b.focus(); return; }
    if (digitando && !(naBusca && (e.key === 'ArrowDown' || e.key === 'Enter'))) return;
    var lista = this._seqsPagina || [];
    var k = lista.indexOf(s.sel);
    if (e.key === 'ArrowDown' && lista.length) {
      e.preventDefault(); if (naBusca) alvo.blur();
      this.setState({ sel: lista[k < 0 ? 0 : Math.min(k + 1, lista.length - 1)] }); this.rolarSel();
    } else if (e.key === 'ArrowUp' && lista.length) {
      e.preventDefault(); this.setState({ sel: lista[k <= 0 ? 0 : k - 1] }); this.rolarSel();
    } else if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A') {
      var alvoSeq = k >= 0 ? s.sel : (naBusca && lista.length === 1 ? lista[0] : null);
      if (alvoSeq != null) { e.preventDefault(); this.setState({ sel: alvoSeq, ver: alvoSeq, verRev: null }); }
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !digitando) {
      var n = this._nPag || 1;
      var pag = Math.min(s.pag, n) + (e.key === 'ArrowRight' ? 1 : -1);
      if (pag >= 1 && pag <= n) { e.preventDefault(); this.setState({ pag: pag, sel: null }); }
    }
  }

  rolarSel() {
    setTimeout(() => { try { var el = document.querySelector('[data-sel="1"]'); if (el) el.scrollIntoView({ block: 'nearest' }); } catch (e) {} }, 0);
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer);
    if (this._t0) clearTimeout(this._t0);
    if (this._medir) window.removeEventListener('resize', this._medir);
    if (this._ro) this._ro.disconnect();
    if (this._tecla) document.removeEventListener('keydown', this._tecla);
  }

  formLimpo() {
    return { predio: '', predioTxt: '', predioAberto: false, predioAtivo: 0, sis: '', disc: '', tipo: '', fase: '', status: '', acesso: '', sigilo: '', comentario: '', file: null, drag: false, erroArq: '', tentou: false, dupOk: false, verParecidos: false, tituloDoc: '', autor: '', ticket: '', emissao: '', sei: '', statusMexido: false };
  }

  pad(n) { return String(n).padStart(5, '0'); }
  vigRev(seq) { var l = this.doSeq(seq).filter((x) => x.status === 'Aprovado'); return l.length ? Math.max.apply(null, l.map((x) => x.rev)) : this.maxRev(seq); }
  revTxt(r) { return 'R' + String(r).padStart(2, '0'); }
  base(d) { return [d.predio, d.disc, d.sis, d.tipo, this.pad(d.seq)].join('-'); }
  nomeDe(d) { return this.base(d) + '-' + this.revTxt(d.rev) + '.' + d.ext; }
  titulo(d) { return (TIPOS[d.tipo] || d.tipo) + ' · ' + (DISCS[d.disc] || d.disc) + (d.sis ? ' / ' + nomeSis(d.disc, d.sis) : ''); }
  dataBR(iso) { if (!iso) return ''; var p = iso.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }
  fmtSize(b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB'; }
  fmt(n) { return n.toLocaleString('pt-BR'); }
  extEstilo(ext, grande) {
    var c = EXT_COR[ext] || ['#F1F3F6', '#4B5563'];
    return 'flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: ' + (grande ? '46px' : '42px') + '; height: ' + (grande ? '40px' : '36px') + '; padding: 0 6px; box-sizing: border-box; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; background: ' + c[0] + '; color: ' + c[1] + ';';
  }

  indice() {
    if (this._ref === this.state.docs) return this._idx;
    var porSeq = new Map();
    this.state.docs.forEach((d) => { if (d.excluido) return; if (!porSeq.has(d.seq)) porSeq.set(d.seq, []); porSeq.get(d.seq).push(d); });
    var grupos = [];
    var global = { status: {}, disc: {}, tipo: {}, sisK: {}, predio: {} };
    porSeq.forEach((lista, seq) => {
      var ult = 0;
      lista.forEach((x) => { if (x.rev > ult) ult = x.rev; });
      var d0 = lista.find((x) => x.rev === ult);
      var d = Object.assign({ sisK: d0.disc + '.' + d0.sis }, d0);
      Object.keys(global).forEach((k) => { global[k][d[k]] = (global[k][d[k]] || 0) + 1; });
      grupos.push({
        seq: seq, d: d, ult: ult, lista: lista, emTs: tsBR(d.emissao) || d.ts,
        coment: (lista.slice().sort((x, y) => y.rev - x.rev).find((x) => x.comentario) || {}).comentario || '',
        texto: semAcento([this.base(d), PREDIOS[d.predio], TIPOS[d.tipo], NATUREZA[d.tipo], DISCS[d.disc], nomeSis(d.disc, d.sis), d.status, FASES[d.fase]].concat(lista.map((x) => [x.comentario || '', x.por || '', x.ticket || '', x.sei || ''].join(' '))).join(' '))
      });
    });
    this._ref = this.state.docs;
    this._idx = { porSeq: porSeq, grupos: grupos, global: global };
    return this._idx;
  }
  doSeq(seq) { return this.indice().porSeq.get(seq) || []; }
  maxRevTodas(seq) { var m = 0; this.state.docs.forEach((x) => { if (x.seq === seq && x.rev > m) m = x.rev; }); return m; }
  maxRev(seq) { var m = 0; this.doSeq(seq).forEach((x) => { if (x.rev > m) m = x.rev; }); return m; }

  aviso(msg, extra) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.setState({ flash: null, destaque: null }), 3700);
    var alerta = /^(Salve|Não foi|Arquivo fictício|A classificação é a mesma|Nenhum)/.test(msg);
    var n = ((this.state.flash && this.state.flash.n) || 0) + 1;
    this.setState(Object.assign({ flash: { msg: msg, alerta: alerta, n: n } }, extra || {}));
  }

  abrirForm(modo, seq) {
    var extra = { form: { modo: modo, seq: seq != null ? seq : null }, edicao: null, menuConta: false };
    if (modo === 'revisao') {
      var u = this.maxRev(seq);
      var d = this.doSeq(seq).find((x) => x.rev === u);
      Object.assign(extra, { predio: d.predio, sis: d.sis, disc: d.disc, tipo: d.tipo, fase: d.fase, acesso: d.acesso, sigilo: d.acesso === 'Informação classificada' ? d.sigilo : '' });
    }
    extra.status = modo === 'novo' ? '' : statusPadrao(extra.tipo || '');
    extra.statusMexido = false;
    if (faseAuto(extra.tipo)) extra.fase = faseAuto(extra.tipo);
    this.setState(Object.assign(this.formLimpo(), extra));
  }

  opcoesPredio(txt) {
    var q = semAcento(txt).trim();
    if (q) return PREDIO_LISTA.filter((p) => p.chave.indexOf(q) >= 0).slice(0, 60);
    var rec = (this.state.recentes || []).map((c) => PREDIO_LISTA.find((p) => p.cod === c)).filter(Boolean).map((p) => Object.assign({}, p, { rec: true }));
    return rec.concat(PREDIO_LISTA.filter((p) => !rec.some((r) => r.cod === p.cod))).slice(0, 60);
  }

  combo(pref, valorKey, contagens, estilo) {
    var s = this.state;
    var txt = s[pref + 'Txt'], aberto = s[pref + 'Aberto'], ativoI = s[pref + 'Ativo'];
    var ops = aberto ? this.opcoesPredio(txt) : [];
    var at = Math.min(ativoI, Math.max(ops.length - 1, 0));
    var filtro = !!contagens;
    var escolher = (p) => {
      var o = {}; o[valorKey] = p.cod; o[pref + 'Txt'] = p.nome; o[pref + 'Aberto'] = false; o[pref + 'Ativo'] = 0;
      if (filtro) o.pag = 1;
      this.setState(o);
    };
    return {
      txt: txt, aberto: aberto, semOpcao: aberto && ops.length === 0, estilo: estilo, temValor: !!s[valorKey],
      limpar: () => { var o = {}; o[valorKey] = ''; o[pref + 'Txt'] = ''; if (filtro) o.pag = 1; this.setState(o); },
      opcoes: ops.map((p, i) => {
        var n = filtro ? (contagens[p.cod] || 0) : 0;
        return {
          nome: p.nome, ativo: i === at, qtd: filtro ? this.fmt(n) : '', tag: p.rec ? 'Recente' : '',
          escolher: (e) => { e.preventDefault(); escolher(p); },
          estiloQtd: 'flex: none; font-size: 12px; font-variant-numeric: tabular-nums; color: ' + (n ? '#6E7885' : '#B2BAC4') + ';',
          estilo: 'width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 14px; border: none; text-align: left; font: inherit; font-size: 13.5px; cursor: pointer; ' +
            (i === at ? 'background: #F1F2F4;' : 'background: #FFFFFF;') + (filtro && !n ? ' color: #6E7885;' : ' color: #1F2937;') + (p.cod === s[valorKey] ? ' font-weight: 600;' : '')
        };
      }),
      onChange: (e) => { var o = {}; o[pref + 'Txt'] = e.target.value; o[valorKey] = ''; o[pref + 'Aberto'] = true; o[pref + 'Ativo'] = 0; if (filtro) o.pag = 1; this.setState(o); },
      onFocus: () => { var o = {}; o[pref + 'Aberto'] = true; this.setState(o); },
      onBlur: () => {
        var o = {}; o[pref + 'Aberto'] = false;
        if (filtro && !this.state[valorKey]) o[pref + 'Txt'] = '';
        this.setState(o);
      },
      onKeyDown: (e) => {
        var lista = this.opcoesPredio(this.state[pref + 'Txt']);
        var o = {};
        if (e.key === 'ArrowDown') { e.preventDefault(); o[pref + 'Aberto'] = true; o[pref + 'Ativo'] = Math.min(this.state[pref + 'Ativo'] + 1, lista.length - 1); this.setState(o); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); o[pref + 'Ativo'] = Math.max(this.state[pref + 'Ativo'] - 1, 0); this.setState(o); }
        else if (e.key === 'Enter' && this.state[pref + 'Aberto'] && lista[this.state[pref + 'Ativo']]) { e.preventDefault(); escolher(lista[this.state[pref + 'Ativo']]); }
        else if (e.key === 'Escape') { e.stopPropagation(); o[pref + 'Aberto'] = false; this.setState(o); }
      }
    };
  }

  takeFile(f) {
    if (!f) return;
    var ext = f.name.indexOf('.') >= 0 ? f.name.split('.').pop().toLowerCase() : '';
    if (EXTS.indexOf(ext) < 0) { this.setState({ erroArq: 'Este formato não é aceito. Use PDF, DWG, DXF, DWF, RVT, IFC, SKP, DOC(X), XLS(X), JPG, PNG, TIF, KMZ ou ZIP.', drag: false }); return; }
    this.setState({ file: { obj: f, nome: f.name, size: f.size, ext: ext === 'jpeg' ? 'jpg' : ext, hash: '' }, erroArq: '', drag: false, dupOk: false });
    try {
      f.arrayBuffer().then((b) => crypto.subtle.digest('SHA-256', b)).then((h) => {
        var hex = Array.from(new Uint8Array(h)).map((x) => x.toString(16).padStart(2, '0')).join('');
        if (this.state.file && this.state.file.obj === f) this.setState({ file: Object.assign({}, this.state.file, { hash: hex }) });
      }).catch(() => {});
    } catch (e) {}
  }

  duplicado() {
    var s = this.state;
    if (!s.file || !s.file.hash) return null;
    return s.docs.find((x) => x.hash === s.file.hash) || null;
  }

  /* documentos com a mesma classificação: talvez seja revisão de um deles */
  parecidos() {
    var s = this.state;
    if (!s.form || s.form.modo !== 'novo' || !s.predio || !s.disc || !s.tipo) return [];
    return this.indice().grupos.filter((g) => g.d.predio === s.predio && g.d.disc === s.disc && g.d.tipo === s.tipo)
      .sort((a, b) => b.d.ts - a.d.ts);
  }

  virarRevisao(seq) {
    var s = this.state;
    var u = this.maxRev(seq);
    var d = this.doSeq(seq).find((x) => x.rev === u);
    this.setState({ form: { modo: 'revisao', seq: seq, deNovo: { predio: s.predio, predioTxt: s.predioTxt, sis: s.sis, disc: s.disc, tipo: s.tipo } }, verParecidos: false, predio: d.predio, sis: d.sis, disc: d.disc, tipo: d.tipo, fase: s.fase || d.fase, acesso: s.acesso || d.acesso, sigilo: s.sigilo || (d.acesso === 'Informação classificada' ? d.sigilo : ''), tentou: false });
  }

  podeBaixar(d) { return d.acesso !== 'Informação classificada' || (!!this.state.usuario && this.state.perfil === 'gestor'); }

  baixarDoc(d) {
    if (!this.podeBaixar(d)) { this.setState({ sigilo: { codigo: this.nomeDe(d).replace(/\.[^.]+$/, ''), grau: d.sigilo } }); return; }
    if (!d.url) { this.aviso('Arquivo fictício do protótipo: não há conteúdo para baixar'); return; }
    try {
      var a = document.createElement('a');
      a.href = d.url; a.download = this.nomeDe(d);
      document.body.appendChild(a); a.click(); a.remove();
      this.aviso('Baixando ' + this.nomeDe(d));
    } catch (e) { this.aviso('Não foi possível baixar o arquivo'); }
  }

  /* ---------- lixeira (gestor) ---------- */
  ajustarVigente(docs, seq) {
    var vivos = docs.filter((x) => x.seq === seq && !x.excluido);
    if (!vivos.length || vivos.some((x) => x.status === 'Aprovado')) return docs;
    var subs = vivos.filter((x) => x.status === 'Substituído');
    if (!subs.length) return docs;
    var r = Math.max.apply(null, subs.map((x) => x.rev));
    return docs.map((x) => (x.seq === seq && x.rev === r && !x.excluido ? Object.assign({}, x, { status: 'Aprovado' }) : x));
  }

  confirmarExclusao() {
    var s = this.state, e = s.exclusao;
    if (e.motivo.trim().length < 10) { this.setState({ exclusao: Object.assign({}, e, { tentou: true }) }); return; }
    var u = this.maxRev(e.seq);
    var marca = { ts: Date.now(), por: s.usuario, motivo: e.motivo.trim(), alvo: e.alvo, rev: u };
    var docs = s.docs.map((x) => (x.seq === e.seq && !x.excluido && (e.alvo === 'doc' || x.rev === u) ? Object.assign({}, x, { excluido: marca }) : x));
    if (e.alvo === 'rev') docs = this.ajustarVigente(docs, e.seq);
    var hist = Object.assign({}, s.hist);
    hist[e.seq] = (s.hist[e.seq] || []).concat([{ ts: marca.ts, por: s.usuario, acao: e.alvo === 'doc' ? 'Documento excluído' : 'Revisão ' + this.revTxt(u) + ' excluída', detalhe: 'Justificativa: ' + marca.motivo }]);
    var fim = e.alvo === 'doc' ? { ver: null, verRev: null, sel: null } : { verRev: null };
    this.aviso(e.alvo === 'doc' ? 'Documento movido para a lixeira' : 'Revisão ' + this.revTxt(u) + ' movida para a lixeira', Object.assign({ docs: docs, hist: hist, exclusao: null }, fim));
  }

  restaurar(seq, ts) {
    var s = this.state;
    var alvo = s.docs.filter((x) => x.seq === seq && x.excluido && x.excluido.ts === ts);
    if (!alvo.length) return;
    var m = alvo[0].excluido;
    var docs = s.docs.map((x) => (x.seq === seq && x.excluido && x.excluido.ts === ts ? Object.assign({}, x, { excluido: null }) : x));
    if (m.alvo === 'rev' && alvo.some((x) => x.status === 'Aprovado')) {
      var maiorAprov = docs.filter((x) => x.seq === seq && !x.excluido && x.status === 'Aprovado' && x.rev > m.rev).length;
      docs = docs.map((x) => {
        if (x.seq !== seq || x.excluido) return x;
        if (maiorAprov && x.rev === m.rev) return Object.assign({}, x, { status: 'Substituído' });
        if (!maiorAprov && x.rev < m.rev && x.status === 'Aprovado') return Object.assign({}, x, { status: 'Substituído' });
        return x;
      });
    }
    var hist = Object.assign({}, s.hist);
    hist[seq] = (s.hist[seq] || []).concat([{ ts: Date.now(), por: s.usuario, acao: m.alvo === 'doc' ? 'Documento restaurado da lixeira' : 'Revisão ' + this.revTxt(m.rev) + ' restaurada da lixeira', detalhe: '' }]);
    this.aviso(m.alvo === 'doc' ? 'Documento ' + this.pad(seq) + ' restaurado' : 'Revisão ' + this.revTxt(m.rev) + ' restaurada', { docs: docs, hist: hist });
  }

  faltas() {
    var s = this.state;
    if (s.edicao && s.edicao.tipo === 'classif') return { predio: !s.predio, sis: !s.sis, disc: !s.disc, tipo: !s.tipo, justificativa: s.justificativa.trim().length < 10 };
    if (s.edDet && s.edDet.modo === 'classif') return { predio: !s.predio, sis: !s.sis, disc: !s.disc, tipo: !s.tipo, justificativa: s.justificativa.trim().length < 10 };
    if (s.edDet) return { fase: !s.fase, status: !s.status, acesso: !s.acesso, sigilo: s.acesso === 'Informação classificada' && !s.sigilo };
    if (s.edicao) return { fase: !s.fase, status: !s.status, acesso: !s.acesso, sigilo: s.acesso === 'Informação classificada' && !s.sigilo };
    var f = { arquivo: !s.file, fase: !s.fase, status: !s.status, acesso: !s.acesso, sigilo: s.acesso === 'Informação classificada' && !s.sigilo };
    if (s.form && s.form.modo === 'novo') Object.assign(f, { predio: !s.predio, sis: !s.sis, disc: !s.disc, tipo: !s.tipo });
    return f;
  }

  salvar() {
    var s = this.state;
    var f = this.faltas();
    if (Object.keys(f).some((k) => f[k])) { this.setState({ tentou: true }); return; }
    if (this.duplicado() && !s.dupOk) { this.setState({ tentou: true }); return; }
    var rev = s.form.modo === 'revisao';
    var seq = rev ? s.form.seq : s.nextSeq;
    var doc_prev = rev ? this.maxRev(seq) : -1;
    var agora = new Date();
    var doc = {
      seq: seq, rev: rev ? this.maxRevTodas(seq) + 1 : 0, predio: s.predio, sis: s.sis, disc: s.disc, tipo: s.tipo,
      fase: s.fase, status: s.status, acesso: s.acesso, sigilo: s.acesso === 'Informação classificada' ? s.sigilo : 'Não se aplica',
      ext: s.file.ext, size: s.file.size, ts: agora.getTime(),
      data: String(agora.getDate()).padStart(2, '0') + '/' + String(agora.getMonth() + 1).padStart(2, '0') + '/' + agora.getFullYear(),
      por: s.usuario || 'Não identificado', url: URL.createObjectURL(s.file.obj), comentario: s.comentario.trim(), hash: s.file.hash || '',
      ticket: s.ticket.trim(), sei: rev ? (this.doSeq(seq).find((x) => x.rev === doc_prev) || {}).sei || '' : s.sei.trim()
    };
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.setState({ destaque: null }), 6000);
    var anteriores = rev && doc.status === 'Aprovado' ? s.docs.map((x) => (x.seq === seq && x.rev < doc.rev && x.status === 'Aprovado' ? Object.assign({}, x, { status: 'Substituído' }) : x)) : s.docs;
    this.setState({
      docs: anteriores.concat([doc]), nextSeq: rev ? s.nextSeq : s.nextSeq + 1,
      recentes: [doc.predio].concat((s.recentes || []).filter((c) => c !== doc.predio)).slice(0, 5),
      tentou: false, destaque: seq, verRev: null, sel: seq,
      sucesso: {
        seq: seq, ext: doc.ext, nome: this.nomeDe(doc), predio: doc.predio,
        titulo: rev ? 'Revisão ' + this.revTxt(doc.rev) + ' Incluída com Sucesso' : 'Documento Incluído com Sucesso',
        descricao: this.titulo(doc) + ' · ' + nomePredio(doc.predio)
      }
    });
  }

  /* edição no próprio modal do documento */
  iniciarEdicaoDet(seq, rev) {
    var d = this.doSeq(seq).find((x) => x.rev === rev);
    this.setState(Object.assign(this.formLimpo(), {
      edDet: { seq: seq, rev: rev, sair: false }, avisoEd: '', tentou: false,
      fase: d.fase, status: d.status, acesso: d.acesso, sigilo: d.acesso === 'Informação classificada' ? d.sigilo : '', comentario: d.comentario || '',
      ticket: d.ticket || '', sei: d.sei || '', tipo: d.tipo
    }));
  }

  iniciarCorrecaoDet(seq) {
    var d = this.doSeq(seq).find((x) => x.rev === this.maxRev(seq));
    this.setState(Object.assign(this.formLimpo(), {
      edDet: { seq: seq, rev: d.rev, sair: false, modo: 'classif' }, avisoEd: '', tentou: false, verRev: null, verAlt: false,
      predio: d.predio, predioTxt: PREDIOS[d.predio] || d.predio, disc: d.disc, sis: d.sis, tipo: d.tipo, justificativa: ''
    }));
  }

  alteradoDet() {
    var s = this.state;
    if (!s.edDet) return false;
    var d = this.doSeq(s.edDet.seq).find((x) => x.rev === s.edDet.rev);
    if (s.edDet.modo === 'classif') return s.predio !== d.predio || s.disc !== d.disc || s.sis !== d.sis || s.tipo !== d.tipo || !!s.justificativa.trim();
    return s.fase !== d.fase || s.status !== d.status || s.acesso !== d.acesso || (s.acesso === 'Informação classificada' && s.sigilo !== d.sigilo) || s.comentario.trim() !== (d.comentario || '') ||
      s.ticket.trim() !== (d.ticket || '') || s.sei.trim() !== (d.sei || '');
  }

  /* fechar o documento: se houver edição não salva, pergunta antes */
  fecharDetalheSeguro() {
    var s = this.state;
    if (s.edDet) {
      if (this.alteradoDet()) { this.setState({ edDet: Object.assign({}, s.edDet, { sair: true }) }); return; }
      this.setState({ edDet: null, tentou: false, avisoEd: '' });
    }
    this.setState({ ver: null, verRev: null, verAlt: false });
  }

  abrirEdicao(tipo, seq, rev) {
    var r = rev != null ? rev : this.maxRev(seq);
    var d = this.doSeq(seq).find((x) => x.rev === r);
    var o = Object.assign(this.formLimpo(), { edicao: { tipo: tipo, seq: seq, rev: r }, justificativa: '', avisoEd: '' });
    if (tipo === 'classif') Object.assign(o, { predio: d.predio, predioTxt: PREDIOS[d.predio] || d.predio, sis: d.sis, disc: d.disc, tipo: d.tipo });
    else Object.assign(o, { fase: d.fase, status: d.status, acesso: d.acesso, sigilo: d.acesso === 'Informação classificada' ? d.sigilo : '', comentario: d.comentario || '' });
    this.setState(o);
  }

  registrar(seq, acao, detalhe, extra, msg) {
    var s = this.state;
    var hist = Object.assign({}, s.hist);
    hist[seq] = (s.hist[seq] || []).concat([{ ts: Date.now(), por: s.usuario, acao: acao, detalhe: detalhe }]);
    this.aviso(msg, Object.assign({ hist: hist, edicao: null, edDet: null, tentou: false, avisoEd: '' }, extra));
  }

  salvarInfo() {
    var s = this.state;
    var f = this.faltas();
    if (Object.keys(f).some((k) => f[k])) { this.setState({ tentou: true, avisoEd: '' }); return; }
    var ed = s.edDet || s.edicao;
    var d = this.doSeq(ed.seq).find((x) => x.rev === ed.rev);
    var novo = { fase: s.fase, status: s.status, acesso: s.acesso, sigilo: s.acesso === 'Informação classificada' ? s.sigilo : 'Não se aplica', comentario: s.comentario.trim() };
    var mud = [];
    if (s.edDet) {
      novo.ticket = s.ticket.trim();
      novo.sei = s.sei.trim();
      if (novo.sei !== (d.sei || '')) mud.push('Processo SEI: ' + (d.sei || '—') + ' → ' + (novo.sei || '—'));
      if (novo.ticket !== (d.ticket || '')) mud.push('Número do ticket: ' + (d.ticket || '—') + ' → ' + (novo.ticket || '—'));
    }
    if (novo.status !== d.status) mud.push('Status: ' + d.status + ' → ' + novo.status);
    if (novo.fase !== d.fase) mud.push('Etapa: ' + (FASES[d.fase] || '—') + ' → ' + FASES[novo.fase]);
    if (novo.acesso !== d.acesso) mud.push('Acesso: ' + d.acesso + ' → ' + novo.acesso);
    if (novo.sigilo !== d.sigilo && novo.acesso === 'Informação classificada') mud.push('Sigilo: ' + novo.sigilo);
    if (novo.comentario !== (d.comentario || '')) mud.push('Descrição atualizada');
    if (!mud.length) { this.setState({ edDet: null, avisoEd: '', tentou: false }); return; }
    var subst = novo.status === 'Aprovado' && d.status !== 'Aprovado' ? this.doSeq(ed.seq).filter((x) => x.rev < ed.rev && x.status === 'Aprovado').map((x) => x.rev) : [];
    if (subst.length) mud.push(subst.map((r) => this.revTxt(r)).join(', ') + ' passou a Substituído');
    var docs = s.docs.map((x) => (x.seq === ed.seq && x.rev === ed.rev ? Object.assign({}, x, novo) : (x.seq === ed.seq && subst.indexOf(x.rev) >= 0 ? Object.assign({}, x, { status: 'Substituído' }) : x)));
    this.registrar(ed.seq, 'Informações da ' + this.revTxt(ed.rev) + ' editadas', mud.join('\n'), { docs: docs }, 'Alterações salvas');
  }

  salvarClassif() {
    var s = this.state;
    var f = this.faltas();
    if (Object.keys(f).some((k) => f[k])) {
      this.setState({ tentou: true, avisoEd: f.justificativa && !f.predio && !f.sis && !f.disc && !f.tipo ? 'Escreva uma justificativa com pelo menos 10 caracteres.' : '' });
      return;
    }
    var ed = s.edicao || s.edDet;
    var d = this.doSeq(ed.seq)[0];
    var mud = [];
    if (s.predio !== d.predio) mud.push('Prédio: ' + PREDIOS[d.predio] + ' → ' + PREDIOS[s.predio]);
    if (s.sis !== d.sis || s.disc !== d.disc) mud.push('Assunto: ' + nomeSis(d.disc, d.sis) + ' → ' + nomeSis(s.disc, s.sis));
    if (s.disc !== d.disc) mud.push('Disciplina: ' + DISCS[d.disc] + ' → ' + DISCS[s.disc]);
    if (s.tipo !== d.tipo) mud.push('Tipo: ' + TIPOS[d.tipo] + ' → ' + TIPOS[s.tipo]);
    if (!mud.length) { this.setState({ avisoEd: 'A classificação é a mesma. Nada a corrigir.' }); return; }
    var nova = { predio: s.predio, sis: s.sis, disc: s.disc, tipo: s.tipo };
    if (faseAuto(s.tipo) && s.tipo !== d.tipo) nova.fase = faseAuto(s.tipo);
    var docs = s.docs.map((x) => (x.seq === ed.seq ? Object.assign({}, x, nova) : x));
    mud.push('Justificativa: ' + s.justificativa.trim());
    this.registrar(ed.seq, 'Classificação corrigida e arquivos renomeados', mud.join('\n'), { docs: docs }, 'Classificação corrigida · arquivos renomeados');
  }

  /* login só quando a ação exige; depois de entrar, a ação continua sozinha */
  exigirLogin(acao, motivo) {
    if (this.state.usuario) { acao(); return; }
    this._apos = acao;
    this.setState({ login: true, loginErro: '', loginMotivo: motivo || '', menuConta: false });
  }

  entrar() {
    var s = this.state;
    if (!s.loginUsuario.trim() || !s.loginSenha) { this.setState({ loginErro: !s.loginUsuario.trim() && !s.loginSenha ? 'Informe usuário e senha.' : (!s.loginSenha ? 'Informe a senha.' : 'Informe o usuário.') }); return; }
    this.setState({ usuario: s.loginUsuario.trim(), perfil: s.loginPerfil, loginSenha: '', loginErro: '', login: false });
    var acao = this._apos;
    this._apos = null;
    if (acao) acao();
  }

  fecharTopo() {
    var s = this.state;
    if (s.sucesso) return this.setState({ sucesso: null, form: null });
    if (s.pop) return this.setState({ pop: null, popBusca: '' });
    if (s.verAlt) return this.setState({ verAlt: false });
    if (s.sigilo) return this.setState({ sigilo: null });
    if (s.exclusao) return this.setState({ exclusao: null });
    if (s.lixeira) return this.setState({ lixeira: false });
    if (s.info) return this.setState({ info: false });
    if (s.login) { this._apos = null; return this.setState({ login: false }); }
    if (s.edicao) return this.setState({ edicao: null, tentou: false, avisoEd: '' });
    if (s.form) return this.setState({ form: null, tentou: false });
    if (s.ver != null) return this.fecharDetalheSeguro();
    if (s.menuConta) return this.setState({ menuConta: false });
  }

  copiar(texto, msg) {
    var ok = msg || 'Código copiado';
    try {
      navigator.clipboard.writeText(texto).then(() => this.aviso(ok), () => this.aviso('Não foi possível copiar'));
    } catch (e) { this.aviso('Não foi possível copiar'); }
  }

  renderVals() {
    var s = this.state;
    var idx = this.indice();
    var fmt = (n) => this.fmt(n);

    /* ---------- pesquisa e filtros (contagem por opção) ---------- */
    var bruto = s.busca.trim();
    var soNumero = /^\d{1,8}$/.test(bruto);
    var nSeq = soNumero ? parseInt(bruto, 10) : null;
    var tokens = soNumero ? [] : semAcento(bruto).split(/\s+/).filter(Boolean);
    var sels = FILTROS.map((f) => s[f.k]);
    var cont = {};
    FILTROS.forEach((f) => { cont[f.k] = {}; });
    var res = [];
    var gs = idx.grupos;
    for (var i = 0; i < gs.length; i++) {
      var g = gs[i];
      if (soNumero) { if (g.seq !== nSeq) continue; }
      else {
        var ok = true;
        for (var t = 0; t < tokens.length; t++) if (g.texto.indexOf(tokens[t]) < 0) { ok = false; break; }
        if (!ok) continue;
      }
      var falha = -1, nf = 0;
      for (var j = 0; j < FILTROS.length; j++) {
        var sel = sels[j];
        if (sel.length && sel.indexOf(g.d[FILTROS[j].campo]) < 0) { nf++; falha = j; if (nf > 1) break; }
      }
      if (nf === 0) {
        res.push(g);
        for (var j2 = 0; j2 < FILTROS.length; j2++) { var v = g.d[FILTROS[j2].campo]; var m = cont[FILTROS[j2].k]; m[v] = (m[v] || 0) + 1; }
      } else if (nf === 1) {
        var f1 = FILTROS[falha]; var v1 = g.d[f1.campo]; var m1 = cont[f1.k]; m1[v1] = (m1[v1] || 0) + 1;
      }
    }

    /* ---------- ordenação e paginação ---------- */
    var chave = {
      seq: (x) => x.seq, data: (x) => x.d.ts, disc: (x) => DISCS[x.d.disc] || x.d.disc,
      doc: (x) => TIPOS[x.d.tipo] || x.d.tipo,
      predio: (x) => PREDIOS[x.d.predio] || x.d.predio,
      status: (x) => STATUS_ORDEM.indexOf(x.d.status)
    }[s.ordem];
    var dir = s.direcao === 'asc' ? 1 : -1;
    res.sort((a, b) => {
      var x = chave(a), y = chave(b);
      var c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR');
      return c !== 0 ? c * dir : b.seq - a.seq;
    });
    var total = res.length;
    var porPag = s.porPagina;
    var nPag = Math.max(1, Math.ceil(total / porPag));
    var pag = Math.min(s.pag, nPag);
    var ini = (pag - 1) * porPag;
    var fatia = res.slice(ini, ini + porPag);
    this._seqsPagina = fatia.map((x) => x.seq);
    this._nPag = nPag;

    var badge = (st) => {
      var c = STATUS_COR[st] || STATUS_COR['Cancelado'];
      return 'display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 8px; border-radius: 999px; font-size: 12.5px; font-weight: 600; white-space: nowrap; background: ' + c[0] + '; color: ' + c[1] + ';';
    };
    var ponto = (st) => {
      var c = STATUS_COR[st] || STATUS_COR['Cancelado'];
      return 'flex: none; width: 7px; height: 7px; border-radius: 50%; background: ' + c[2] + ';';
    };

    var linhas = fatia.map((x) => {
      var sel = s.sel === x.seq;
      var marcado = !sel && s.destaque === x.seq;
      var bgLinha = sel ? 'background: #E8F6EE; box-shadow: inset 3px 0 0 #2E9E5B;' : (marcado ? 'background: #F1F2F4; box-shadow: inset 3px 0 0 #5A6370;' : 'background: #FFFFFF;');
      var cod = this.base(x.d);
      var vR = x.lista.some((y) => y.status === 'Aprovado') ? Math.max.apply(null, x.lista.filter((y) => y.status === 'Aprovado').map((y) => y.rev)) : x.ult;
      var vig = x.lista.find((y) => y.rev === vR);
      return {
        seq: this.pad(x.seq), titulo: this.titulo(x.d), coment: x.coment, temComent: !!x.coment,
        tituloPartes: partes(TIPOS[x.d.tipo] || x.d.tipo, tokens), codigoPartes: partes(cod, tokens), comentPartes: partes(x.coment, tokens),
        predioPartes: partes(PREDIOS[x.d.predio] || x.d.predio, tokens),
        dica: cod,
        selAttr: sel ? '1' : '0',
        ariaBaixar: this.podeBaixar(vig) ? 'Baixar revisão vigente ' + this.revTxt(vR) + ' (' + vig.ext.toUpperCase() + ')' : 'Documento sigiloso · solicite acesso',
        baixar: () => this.baixarDoc(vig),
        predio: PREDIOS[x.d.predio] || x.d.predio, uso: USOS[x.d.predio.split('-')[1]] || '',
        rev: this.revTxt(x.ult), status: x.d.status, data: x.d.data, disc: DISCS[x.d.disc] || x.d.disc, sis: nomeSis(x.d.disc, x.d.sis),
        badge: badge(x.d.status), ponto: ponto(x.d.status),
        livre: this.podeBaixar(vig), sigiloso: !this.podeBaixar(vig),
        pendente: vR !== x.ult, vigTxt: this.revTxt(vR) + ' aprovada',
        aria: 'Abrir ' + this.pad(x.seq) + ', ' + this.titulo(x.d) + ', ' + (PREDIOS[x.d.predio] || x.d.predio),
        sel: sel,
        ariaVer: 'Ver informações do documento ' + this.pad(x.seq),
        hover: sel || marcado ? 'nenhum' : 'linha',
        estiloLinha: 'display: flex; align-items: center; height: ' + s.alturaLinha + 'px; box-sizing: border-box; padding-right: 16px; border-bottom: 1px solid #F1F3F6; ' + bgLinha,
        estilo: 'flex: 1 1 auto; min-width: 0; height: 100%; ' + GRID + ' box-sizing: border-box; padding: 0 0 0 16px; border: none; background: transparent; font: inherit; text-align: left; cursor: pointer; color: inherit;',
        selecionar: () => this.setState({ sel: this.state.sel === x.seq ? null : x.seq, menuConta: false }),
        abrir: () => this.setState({ sel: x.seq, ver: x.seq, verRev: null, verAlt: false, menuConta: false })
      };
    });

    var cols = [['seq', 'Seq.'], ['doc', 'Documento'], ['disc', 'Disciplina'], ['predio', 'Prédio'], [null, 'Rev.'], ['status', 'Status'], ['data', 'Inclusão']];
    var colunas = cols.map((c) => {
      var on = c[0] && s.ordem === c[0];
      return {
        rotulo: c[1], ordenavel: !!c[0], fixa: !c[0],
        seta: on ? (s.direcao === 'asc' ? ' ↑' : ' ↓') : '',
        aria: 'Ordenar por ' + c[1].replace('.', ''),
        ordenar: () => this.setState({ ordem: c[0], direcao: on ? (s.direcao === 'asc' ? 'desc' : 'asc') : (c[0] === 'data' || c[0] === 'seq' ? 'desc' : 'asc'), pag: 1 }),
        estilo: 'display: inline-flex; align-items: center; gap: 2px; background: transparent; border: none; padding: 4px 0; cursor: pointer; font: inherit; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; ' + (on ? 'color: #5A6370;' : 'color: #6E7885;')
      };
    });

    var nums = [];
    for (var p = 1; p <= nPag; p++) if (p === 1 || p === nPag || Math.abs(p - pag) <= 1) nums.push(p);
    var botoesPag = [];
    nums.forEach((p, k) => {
      if (k > 0 && p - nums[k - 1] > 1) botoesPag.push({ ehPagina: false, ehReticencia: true, rotulo: '', atual: 'false', aria: '', ir: () => {}, estilo: '' });
      botoesPag.push({
        ehPagina: true, ehReticencia: false, rotulo: fmt(p), atual: p === pag ? 'page' : 'false', aria: 'Página ' + p,
        ir: () => this.setState({ pag: p }),
        estilo: 'min-width: 28px; height: 28px; padding: 0 6px; border-radius: 6px; border: none; font: inherit; font-size: 12.5px; cursor: pointer; font-variant-numeric: tabular-nums; ' +
          (p === pag ? 'background: #EBEDF0; color: #1F2937; font-weight: 700;' : 'background: transparent; color: #667080; font-weight: 500;')
      });
    });
    var seta = (off) => 'display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: none; padding: 0; background: transparent; ' + (off ? 'color: #CDD3DA; cursor: default;' : 'color: #525C69; cursor: pointer;');

    /* ---------- facetas laterais ---------- */
    var facetas = FILTROS.slice(1).map((f) => {
      var sel = s[f.k];
      var c = cont[f.k];
      var glob = idx.global[f.campo];
      var valores = f.fixo ? STATUS_ORDEM.slice() : Object.keys(f.nomes).sort((a, b) => (glob[b] || 0) - (glob[a] || 0) || f.nomes[a].localeCompare(f.nomes[b], 'pt-BR'));
      var lista = valores.map((v) => ({ v: v, n: c[v] || 0, sel: sel.indexOf(v) >= 0 })).filter((x) => x.n > 0 || x.sel);
      var aberto = !!s.mais[f.k];
      var visiveis = aberto ? lista : lista.filter((x, k) => k < f.limite || x.sel);
      return {
        titulo: f.titulo,
        vazio: lista.length === 0,
        temMais: lista.length > f.limite,
        textoMais: aberto ? 'Mostrar menos' : 'Mostrar todas (' + lista.length + ')',
        alternarMais: () => { var mm = Object.assign({}, this.state.mais); mm[f.k] = !aberto; this.setState({ mais: mm }); },
        itens: visiveis.map((x) => ({
          rotulo: f.nomes[x.v] || x.v, qtd: fmt(x.n), sel: x.sel,
          hover: x.sel ? 'nenhum' : 'suave',
          temPonto: false, ponto: '',
          alternar: () => {
            var atual = this.state[f.k];
            var o = { pag: 1 };
            o[f.k] = atual.indexOf(x.v) >= 0 ? atual.filter((y) => y !== x.v) : atual.concat([x.v]);
            this.setState(o);
          },
          caixa: 'flex: none; display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 4px; box-sizing: border-box; ' +
            (x.sel ? 'background: #6E7783; border: 1.5px solid #6E7783;' : 'background: #FFFFFF; border: 1.5px solid #BDC5CF;'),
          estilo: 'width: 100%; display: flex; align-items: center; gap: 9px; min-height: 32px; padding: 5px 6px; border: none; border-radius: 6px; font: inherit; font-size: 13.5px; text-align: left; cursor: pointer; ' +
            (x.sel ? 'background: #F1F2F4; color: #5A6370; font-weight: 600;' : 'background: transparent; color: #374151;')
        }))
      };
    });

    /* ---------- chips ---------- */
    var chips = [];
    if (bruto) chips.push({ rotulo: 'Pesquisa', texto: soNumero ? 'sequencial exato ' + this.pad(nSeq) : '“' + bruto + '”', aria: 'Remover pesquisa', remover: () => this.setState({ busca: '', pag: 1 }) });
    s.fPredio.forEach((v) => chips.push({ rotulo: 'Prédio', texto: PREDIOS[v], aria: 'Remover filtro de prédio', remover: () => this.setState({ fPredio: this.state.fPredio.filter((y) => y !== v), pag: 1 }) }));
    FILTROS.slice(1).forEach((f) => {
      s[f.k].forEach((v) => chips.push({
        rotulo: f.rotuloChip, texto: f.nomes[v] || v, aria: 'Remover filtro ' + (f.nomes[v] || v),
        remover: () => { var o = { pag: 1 }; o[f.k] = this.state[f.k].filter((y) => y !== v); this.setState(o); }
      }));
    });
    var temFiltroLateral = FILTROS.some((f) => s[f.k].length > 0);
    var temFiltro = temFiltroLateral || !!bruto;
    var limparFiltros = { fPredio: [], fStatus: [], fDisc: [], fTipo: [], fSis: [], pag: 1, pop: null, popBusca: '' };

    /* ---------- filtros em menus suspensos (seleção múltipla com contagem) ---------- */
    var SIS_N = {}, SIS_GRUPO = {}, sisValores = [];
    Object.keys(DISCS).forEach((d) => (SIS_ORDEM[d] || []).forEach((k) => { var v = d + '.' + k; SIS_N[v] = SISTEMAS[d][k]; SIS_GRUPO[v] = DISCS[d]; sisValores.push(v); }));
    var tipoValores = [];
    NATUREZAS.forEach((n) => Object.keys(TIPOS).forEach((t) => { if (NATUREZA[t] === n) tipoValores.push(t); }));
    var DEFS = [
      { k: 'fPredio', campo: 'predio', rotulo: 'Prédio', titulo: 'Prédio ou Unidade', nomes: PREDIOS, busca: true, ph: 'Buscar cidade ou prédio', ordem: 'alfa' },
      { k: 'fStatus', campo: 'status', rotulo: 'Status', titulo: 'Status', nomes: STATUS_NOMES, ordem: 'fixa' },
      { k: 'fDisc', campo: 'disc', rotulo: 'Disciplina', titulo: 'Disciplina', nomes: DISCS, busca: true, ph: 'Buscar disciplina' },
      { k: 'fSis', campo: 'sisK', rotulo: 'Assunto', titulo: 'Assunto', nomes: SIS_N, busca: true, ph: 'Buscar assunto', ordem: 'sis' },
      { k: 'fTipo', campo: 'tipo', rotulo: 'Tipo', titulo: 'Tipo de Documento', nomes: TIPOS, busca: true, ph: 'Buscar tipo', ordem: 'tipo' }
    ];
    var popQ = semAcento(s.popBusca).trim();
    var filtros = DEFS.map((f, i) => {
      var sel = s[f.k];
      var c = cont[f.k];
      var glob = idx.global[f.campo];
      var aberto = s.pop === f.k;
      var ativo = sel.length > 0;
      var valores = f.ordem === 'sis' ? sisValores.filter((v) => !s.fDisc.length || s.fDisc.indexOf(v.split('.')[0]) >= 0) : f.ordem === 'tipo' ? tipoValores.slice() : f.ordem === 'fixa' ? STATUS_ORDEM.slice() : (f.ordem === 'alfa' ? PREDIO_LISTA.map((p) => p.cod) : Object.keys(f.nomes).sort((a, b) => (glob[b] || 0) - (glob[a] || 0) || f.nomes[a].localeCompare(f.nomes[b], 'pt-BR')));
      var opcoes = [];
      if (aberto) {
        opcoes = valores.slice();
        if (popQ) opcoes = opcoes.filter((v) => semAcento(f.nomes[v] || v).indexOf(popQ) >= 0);
      }
      var alternarValor = (v) => {
        var atual = this.state[f.k];
        var o = { pag: 1 };
        o[f.k] = atual.indexOf(v) >= 0 ? atual.filter((y) => y !== v) : atual.concat([v]);
        this.setState(o);
      };
      var limpar = () => { var o = { pag: 1 }; o[f.k] = []; this.setState(o); };
      var base = 'flex: 1 1 auto; min-width: 0; width: 100%; justify-content: space-between; display: inline-flex; align-items: center; gap: 6px; height: 34px; font: inherit; font-size: 13px; white-space: nowrap; cursor: pointer; box-sizing: border-box; ';
      return {
        rotulo: f.rotulo, titulo: f.titulo,
        texto: ativo ? (sel.length === 1 ? (f.nomes[sel[0]] || sel[0]) : f.rotulo + ' (' + sel.length + ')') : f.rotulo,
        dica: ativo ? f.titulo + ': ' + sel.map((v) => f.nomes[v] || v).join(', ') : f.titulo,
        ativo: ativo, aberto: aberto,
        valor: sel.length === 1 ? (f.nomes[sel[0]] || sel[0]) : sel.length + ' selecionados',
        resumo: sel.length ? (sel.length === 1 ? '1 selecionado' : sel.length + ' selecionados') : 'Nenhum selecionado',
        hover: ativo ? 'filtroativo' : 'pilula',
        estilo: base + (ativo
          ? 'padding: 0 10px 0 12px; border-radius: 8px; border: 1px solid rgba(90, 99, 112, 0.18); background: rgba(90, 99, 112, 0.08); color: #5A6370; font-weight: 700;'
          : 'padding: 0 10px 0 12px; border-radius: 8px; border: 1px solid ' + (aberto ? '#6E7783' : '#E4E7EA') + '; background: #FFFFFF; color: #5A6370; font-weight: 500;'),
        ariaLimpar: 'Remover filtro de ' + f.titulo.toLowerCase(),
        alternar: () => this.setState({ pop: aberto ? null : f.k, popBusca: '', menuConta: false }),
        limpar: limpar,
        temBusca: !!f.busca, placeholder: f.ph || '',
        semOpcao: aberto && opcoes.length === 0,
        posPop: 'position: absolute; top: 40px; ' + (i >= 3 ? 'right: 0;' : 'left: 0;') + ' z-index: 25; width: 320px; max-width: calc(100vw - 40px); background: #FFFFFF; border: 1px solid #E8EBF0; border-radius: 12px; box-shadow: 0 18px 44px rgba(15, 23, 35, 0.18); display: flex; flex-direction: column; overflow: hidden;',
        opcoes: opcoes.reduce((acc, v) => { var gr = f.ordem === 'sis' ? SIS_GRUPO[v] : (f.ordem === 'tipo' ? NATUREZA[v] : ''); if (gr && gr !== acc.ultimo) { acc.lista.push({ cab: gr }); acc.ultimo = gr; } acc.lista.push(v); return acc; }, { lista: [], ultimo: '' }).lista.map((v) => {
          if (typeof v === 'object') return { ehCab: true, ehItem: false, rotulo: v.cab, qtd: '', sel: false, hover: '', alternar: () => {}, caixa: '', estilo: '' };
          var marcado = sel.indexOf(v) >= 0;
          var n = c[v] || 0;
          return {
            ehCab: false, ehItem: true, rotulo: f.nomes[v] || v, qtd: fmt(n), sel: marcado,
            hover: marcado ? 'nenhum' : 'suave',
            alternar: () => alternarValor(v),
            caixa: 'flex: none; display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 4px; box-sizing: border-box; ' +
              (marcado ? 'background: #6E7783; border: 1.5px solid #6E7783;' : 'background: #FFFFFF; border: 1.5px solid #BDC5CF;'),
            estilo: 'width: 100%; display: flex; align-items: center; gap: 10px; min-height: 36px; padding: 6px 8px; border: none; border-radius: 6px; font: inherit; font-size: 13.5px; text-align: left; cursor: pointer; ' +
              (marcado ? 'background: #F1F2F4; color: #1F2937; font-weight: 600;' : 'background: transparent; color: ' + (n ? '#374151' : '#A7B0BB') + ';')
          };
        })
      };
    });

    var fpEstilo = 'width: 100%; height: 40px; padding: 0 36px 0 32px; border-radius: 8px; font: inherit; font-size: 14px; box-sizing: border-box; color: #1F2937; ' +
      (s.fPredio ? 'border: 1px solid #5A6370; background: #F1F2F4; font-weight: 600;' : 'border: 1px solid #D7DCE1; background: #FFFFFF;');
    var selFiltro = (ativo) => 'width: 100%; height: 40px; padding: 0 8px; border-radius: 8px; font: inherit; font-size: 14px; box-sizing: border-box; color: #1F2937; ' +
      (ativo ? 'border: 1px solid #5A6370; background: #F1F2F4; font-weight: 600;' : 'border: 1px solid #D7DCE1; background: #FFFFFF;');

    /* ---------- detalhe ---------- */
    var emEdicao = !!s.edDet && s.ver != null && s.edDet.seq === s.ver;
    var nFaltaDet = 0;
    if (emEdicao) { var fD = this.faltas(); nFaltaDet = Object.keys(fD).filter((k) => fD[k]).length; }
    var nFalta = nFaltaDet;
    var det = { seq: '', titulo: '', predio: '', codigo: '', status: '', badge: '', ponto: '', superada: false, revAtual: '', revSel: '', verAtual: () => {}, copiar: () => {}, comentario: '', temComentario: false, revisoes: [], arquivos: [], info: [], historico: [], revisar: () => {}, editar: () => {}, corrigir: () => {} };
    if (s.ver != null && this.doSeq(s.ver).length) {
      var todos = this.doSeq(s.ver);
      var ult = this.maxRev(s.ver);
      var vigR = this.vigRev(s.ver);
      var rsel = s.edDet && s.edDet.seq === s.ver ? s.edDet.rev : (s.verRev != null ? s.verRev : ult);
      var daRev = todos.filter((x) => x.rev === rsel);
      var dd = daRev[0];
      var revs = [];
      todos.forEach((x) => { if (revs.indexOf(x.rev) < 0) revs.push(x.rev); });
      revs.sort((a, b) => b - a);
      var hh = (n) => String(n).padStart(2, '0');
      var eventos = revs.map((r) => {
        var arqs = todos.filter((x) => x.rev === r);
        return { ts: arqs[0].ts, quando: arqs[0].data, por: arqs[0].por, acao: (r === 0 ? 'Documento incluído' : 'Revisão ' + this.revTxt(r) + ' incluída') + ' · ' + arqs.map((x) => x.ext.toUpperCase()).join(', '), detalhe: '', tipo: 'inc' };
      }).concat((s.hist[s.ver] || []).map((h) => {
        var dt = new Date(h.ts);
        return { ts: h.ts, quando: hh(dt.getDate()) + '/' + hh(dt.getMonth() + 1) + '/' + dt.getFullYear() + ' às ' + hh(dt.getHours()) + ':' + hh(dt.getMinutes()), por: h.por, acao: h.acao, detalhe: h.detalhe, tipo: 'ed' };
      })).sort((a, b) => b.ts - a.ts);
      var codigo = this.base(dd);
      var predioNome = nomePredio(dd.predio);
      var uso = USOS[dd.predio.split('-')[1]] || '';
      det = {
        autoria: this.revTxt(rsel) + ' incluída em ' + dd.data + ' por ' + dd.por + (dd.ticket ? '  ·  Ticket: ' + dd.ticket : ''),
        seq: this.pad(dd.seq), titulo: tituloCaso(this.titulo(dd)), predio: predioNome + (uso ? ' · ' + uso : ''), predioNome: predioNome, predioUso: uso, temUso: !!uso && uso !== 'Foro', codigo: codigo,
        status: dd.status, badge: badge(dd.status), ponto: ponto(dd.status),
        superada: rsel !== ult || vigR !== ult, naoSuperada: rsel === ult && vigR === ult, rotuloRev: rsel === ult ? 'Última revisão' : 'Revisão',
        textoVer: rsel !== ult ? 'Ver última' : 'Ver vigente', revAtual: this.revTxt(this.vigRev(s.ver)), revSel: this.revTxt(rsel),
        temPendente: this.vigRev(s.ver) !== ult, pendenteTxt: this.revTxt(ult) + ' · ' + (todos.find((x) => x.rev === ult) || {}).status,
        avisoRev: rsel === ult ? 'A revisão vigente é a ' + this.revTxt(vigR) : (dd.status === 'Substituída' || dd.status === 'Substituído' ? 'Vendo a ' + this.revTxt(rsel) + ', substituída pela ' + this.revTxt(vigR) : 'Vendo a ' + this.revTxt(rsel) + ' · a última é a ' + this.revTxt(ult)),
        verAtual: () => (this.state.edDet ? this.aviso('Salve ou cancele a edição antes de trocar de revisão') : this.setState({ verRev: rsel !== ult ? null : vigR })),
        nomeArquivo: codigo + '-' + this.revTxt(rsel),
        copiar: () => this.copiar(codigo + '-' + this.revTxt(rsel), 'Nome do arquivo copiado'),
        ariaCodigo: 'Copiar o nome do arquivo ' + codigo + '-' + this.revTxt(rsel),
        alteracoes: eventos.filter((e) => e.tipo === 'ed').map((e) => ({ acao: e.acao, detalhe: e.detalhe, temDetalhe: !!e.detalhe, quando: e.quando, por: e.por })),
        temAlteracoes: eventos.some((e) => e.tipo === 'ed'),
        textoAlteracoes: (() => { var n = eventos.filter((e) => e.tipo === 'ed').length; return n === 1 ? '1 alteração registrada' : n + ' alterações registradas'; })(),
        verAlteracoes: !!s.verAlt,
        alternarAlteracoes: () => this.setState({ verAlt: !this.state.verAlt }),
        copiarLink: () => this.copiar(this.linkPara('doc=' + this.pad(dd.seq)), 'Link do documento copiado'),
        comentario: dd.comentario || '', temComentario: !!dd.comentario,
        nRevisoes: revs.length === 1 ? '1 revisão' : revs.length + ' revisões',
        arquivos: revs.map((r) => {
          var x = todos.find((y) => y.rev === r);
          var ativa = r === rsel;
          return {
            rev: this.revTxt(r), ativa: ativa, nome: this.nomeDe(x), url: x.url, temUrl: !!x.url && this.podeBaixar(x), semUrl: !(x.url && this.podeBaixar(x)),
            aria: 'Ver dados da revisão ' + this.revTxt(r),
            meta: x.ext.toUpperCase() + ' · ' + this.fmtSize(x.size) + ' · incluído em ' + x.data + ' por ' + x.por + ' · ' + x.status,
            escolher: () => (this.state.edDet ? this.aviso('Salve ou cancele a edição antes de trocar de revisão') : this.setState({ verRev: r })),
            exemplo: () => this.baixarDoc(x),
            revEstilo: 'flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 40px; height: 26px; padding: 0 6px; box-sizing: border-box; border-radius: 6px; font-family: \'IBM Plex Mono\', monospace; font-size: 12px; font-weight: 500; ' + (r === ult ? 'background: #5A6370; color: #FFFFFF;' : 'background: #F1F2F4; color: #5A6370;'),
            estiloLinha: 'flex: none; display: flex; align-items: center; border-radius: 10px; ' + (ativa ? 'border: 1px solid #5A6370; background: #F4F6F7;' : 'border: 1px solid #E8EBF0; background: #FFFFFF;')
          };
        }),
        info: [
          { rotulo: 'Disciplina', valor: DISCS[dd.disc] || dd.disc },
          { rotulo: 'Tipo de documento', valor: TIPOS[dd.tipo] || dd.tipo },
          { rotulo: 'Etapa', valor: FASES[dd.fase] || '—' },
          { rotulo: 'Acesso', valor: dd.acesso + (dd.acesso === 'Informação classificada' ? ' · ' + dd.sigilo : '') }
        ],
        historico: eventos.map((e, k) => ({
          acao: e.acao, detalhe: e.detalhe, temDetalhe: !!e.detalhe, quando: e.quando, por: e.por,
          marca: 'flex: none; width: 10px; height: 10px; margin-top: 4px; border-radius: 50%; box-sizing: border-box; ' + (e.tipo === 'ed' ? 'background: #FFFFFF; border: 2px solid #C98A0B;' : 'background: #5A6370; border: 2px solid #5A6370;'),
          linha: 'flex: 1; width: 2px; margin-top: 4px; background: ' + (k === eventos.length - 1 ? 'transparent' : '#E8EBF0') + ';'
        })),
        editar: () => this.exigirLogin(() => { this.setState({ verAlt: false, verRev: null }); this.iniciarEdicaoDet(dd.seq, ult); }, 'Para editar informações é preciso estar identificado.'),
        badgeSel: badge(dd.status), pontoSel: ponto(dd.status),
        lendo: !emEdicao, editando: emEdicao,
        editInfo: emEdicao && s.edDet.modo !== 'classif', lendoInfo: !(emEdicao && s.edDet.modo !== 'classif'),
        corrigindo: emEdicao && s.edDet.modo === 'classif', lendoClassif: !(emEdicao && s.edDet.modo === 'classif'), semCorrecao: !(emEdicao && s.edDet.modo === 'classif'),
        fadeC: emEdicao && s.edDet.modo !== 'classif' ? 'opacity: 0.45; transition: opacity .2s ease;' : 'transition: opacity .2s ease;',
        fadeI: emEdicao && s.edDet.modo === 'classif' ? 'opacity: 0.45; transition: opacity .2s ease;' : 'transition: opacity .2s ease;',
        fadeAmbos: emEdicao ? 'opacity: 0.45; transition: opacity .2s ease;' : 'transition: opacity .2s ease;', editandoNormal: emEdicao && !s.edDet.sair, confirmandoSaida: emEdicao && s.edDet.sair,
        v: {
          disc: DISCS[dd.disc] || dd.disc, tipo: (TIPOS[dd.tipo] || dd.tipo) + ' (' + (NATUREZA[dd.tipo] || '') + ')', sis: nomeSis(dd.disc, dd.sis),
          status: dd.status, fase: FASES[dd.fase] || '—', acesso: dd.acesso,
          sigilo: dd.acesso === 'Informação classificada' ? dd.sigilo : 'Não se aplica',
          resp: dd.ticket || '—', sei: dd.sei || '', temSei: !!dd.sei, seiTexto: dd.sei || 'Não informado', estiloSei: dd.sei ? 'color: #1F2937; font-weight: 600; font-variant-numeric: tabular-nums;' : 'color: #97A0AC; font-weight: 500;', incl: dd.data + ' por ' + dd.por
        },
        comentarioTexto: dd.comentario || 'Sem descrição.',
        estiloDescricao: 'height: 108px; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; background: #FAFBFC; border: 1px solid #F1F3F6; overflow-y: auto; font-size: 14px; line-height: 1.5; white-space: pre-line; overflow-wrap: anywhere; color: ' + (dd.comentario ? '#374151;' : '#97A0AC;'),
        avisoEd: s.avisoEd || (s.tentou && nFalta ? (s.edDet && s.edDet.modo === 'classif' && nFalta === 1 && this.faltas().justificativa ? 'Escreva uma justificativa com pelo menos 10 caracteres.' : 'Preencha os campos destacados.') : (s.edDet && s.edDet.modo === 'classif' ? 'Corrigindo a classificação · todos os arquivos serão renomeados; o número sequencial será mantido' : 'Editando a ' + this.revTxt(rsel) + ' · as alterações valem só para esta revisão')),
        estiloAvisoEd: 'flex: 1 1 auto; min-width: 0; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (s.avisoEd || (s.tentou && nFalta) ? '#B42318;' : '#667080;'),
        cancelarEd: () => this.setState({ edDet: null, tentou: false, avisoEd: '' }),
        salvarEd: () => (this.state.edDet && this.state.edDet.modo === 'classif' ? this.salvarClassif() : this.salvarInfo()),
        descartarEd: () => this.setState({ edDet: null, tentou: false, avisoEd: '', ver: null, verRev: null }),
        continuarEd: () => this.setState({ edDet: Object.assign({}, this.state.edDet, { sair: false }) }),
        corrigir: () => this.iniciarCorrecaoDet(dd.seq),
        excluir: () => this.setState({ exclusao: { seq: dd.seq, alvo: revs.length > 1 ? 'rev' : 'doc', motivo: '', tentou: false } }),
        revisar: () => this.exigirLogin(() => this.abrirForm('revisao', dd.seq), 'Para incluir uma nova revisão é preciso estar identificado.')
      };
    }

    /* ---------- formulários ---------- */
    var falta = this.faltas();
    var err = {};
    ['predio', 'sis', 'disc', 'tipo', 'fase', 'status', 'acesso', 'sigilo', 'arquivo', 'justificativa', 'tituloDoc', 'ticket', 'emissao'].forEach((k) => { err[k] = !!(s.tentou && falta[k]); });
    /* campo preenchido ganha contorno verde claro */
    var contorno = (v) => (v && String(v).trim() ? 'border: 1px solid #9AD5B0; box-shadow: 0 0 0 3px rgba(46, 160, 90, 0.08);' : 'border: 1px solid #D8DEE5;');
    var area_ = 'padding: 10px 12px; border-radius: 8px; font: inherit; font-size: 14px; line-height: 1.5; color: #1F2937; background: #FFFFFF; resize: vertical; box-sizing: border-box; width: 100%; ';
    var campo = (k) => 'height: 40px; padding: 0 12px; border-radius: 8px; font: inherit; font-size: 14px; box-sizing: border-box; width: 100%; background: #FFFFFF; color: #1F2937; ' +
      (err[k] ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.1);' : contorno(s[k]));
    var est = {};
    ['predio', 'sis', 'disc', 'tipo', 'fase', 'status', 'acesso', 'sigilo', 'tituloDoc', 'autor', 'ticket', 'emissao', 'sei'].forEach((k) => { est[k] = campo(k); });
    var nFalta = Object.keys(falta).filter((k) => falta[k]).length;
    var revForm = !!s.form && s.form.modo === 'revisao';
    var seqF = s.form ? (revForm ? s.form.seq : s.nextSeq) : null;
    var revF = s.form ? (revForm ? this.maxRevTodas(seqF) + 1 : 0) : 0;
    var parte = (v, ph) => ({ texto: v || ph, estilo: v ? 'color: #1F2937;' : 'color: #B2BAC4;' });
    var hif = { texto: '-', estilo: 'color: #B2BAC4;' };
    var nomePartes = [parte(s.predio, 'PRÉDIO'), hif, parte(s.disc, 'DISC'), hif, parte(s.sis, 'SIS'), hif, parte(s.tipo, 'TIPO'), hif,
      parte(seqF != null ? this.pad(seqF) : '', '00000'), hif, parte(this.revTxt(revF), 'R00'), parte(s.file ? '.' + s.file.ext : '', '.ext')];
    var dRev = revForm ? this.doSeq(seqF).find((x) => x.rev === this.maxRev(seqF)) : null;
    var dupDoc = s.form && !s.sucesso ? this.duplicado() : null;
    var parec = s.sucesso ? [] : this.parecidos();
    var setF = (k) => (e) => this.setState({ [k]: e.target.value, avisoEd: '' });
    var iniciais = s.usuario ? s.usuario.split(/[.\s_-]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('') : '';
    var edDoc = s.edicao ? this.doSeq(s.edicao.seq)[0] : null;
    var nArqEd = s.edicao ? this.doSeq(s.edicao.seq).length : 0;
    var nRevEd = s.edicao ? this.maxRev(s.edicao.seq) + 1 : 0;

    this.sincronizarEndereco(this.consulta(s, s.ver));

    return {
      irInicio: () => this.setState(Object.assign({ busca: '', ver: null, form: null, menuConta: false, ordem: 'data', direcao: 'desc' }, limparFiltros)),
      busca: s.busca,
      setBusca: (e) => this.setState({ busca: e.target.value, pag: 1 }),
      teclaBusca: (e) => { if (e.key === 'Escape') this.setState({ busca: '', pag: 1 }); },
      temBusca: !!s.busca,
      limparBusca: () => this.setState({ busca: '', pag: 1 }),

      logado: !!s.usuario, deslogado: !s.usuario, usuario: s.usuario, iniciais: iniciais,
      perfilTexto: s.perfil === 'gestor' ? 'Gestor do acervo' : 'Técnico',
      perfilDescricao: s.perfil === 'gestor' ? 'Gestor do acervo · pode corrigir classificações' : 'Técnico · pode incluir e editar',
      permissoes: s.perfil === 'gestor' ? ['Consultar e baixar documentos', 'Incluir documentos e revisões', 'Editar informações', 'Corrigir classificações'] : ['Consultar e baixar documentos', 'Incluir documentos e revisões', 'Editar informações'],
      ariaConta: 'Conta de ' + s.usuario + ', ' + (s.perfil === 'gestor' ? 'Gestor do acervo' : 'Técnico'),
      estBotaoConta: 'display: flex; align-items: center; gap: 9px; height: 40px; padding: 0 10px 0 5px; border-radius: 999px; font: inherit; cursor: pointer; border: 1px solid ' + (s.menuConta ? '#D3D9E0; background: #F0F3F7;' : '#E8EBF0; background: #FFFFFF;'),
      estSetaConta: 'flex: none; transition: transform .15s ease; ' + (s.menuConta ? 'transform: rotate(180deg);' : ''),
      gestor: !!s.usuario && s.perfil === 'gestor',
      menuConta: s.menuConta,
      alternarMenu: () => this.setState({ menuConta: !this.state.menuConta }),
      fecharMenu: () => this.setState({ menuConta: false }),
      sair: () => { this.setState({ usuario: '', perfil: 'tecnico', loginUsuario: '', loginSenha: '', menuConta: false, edicao: null, form: null }); this.aviso('Você saiu da conta'); },

      filtros: filtros,
      popBusca: s.popBusca,
      setPopBusca: (e) => this.setState({ popBusca: e.target.value }),
      fecharPop: () => this.setState({ pop: null, popBusca: '' }),
      teclaPop: (e) => { if (e.key === 'Escape' && this.state.pop) { e.stopPropagation(); this.setState({ pop: null, popBusca: '' }); } },
      ordemValor: s.ordem + '|' + s.direcao,
      setOrdem: (e) => { var p = e.target.value.split('|'); this.setState({ ordem: p[0], direcao: p[1], pag: 1 }); },
      facetas: facetas,
      temFiltroLateral: temFiltroLateral,
      limparFiltros: () => this.setState(limparFiltros),

      resumoAcervo: fmt(idx.grupos.length) + ' documentos · ' + fmt(s.docs.length) + ' arquivos · ' + Object.keys(idx.global.predio).length + ' prédios',
      abrirNovo: () => this.exigirLogin(() => this.abrirForm('novo'), 'Para incluir documentos é preciso estar identificado.'),
      loginMotivo: s.loginMotivo || '',
      contagem: temFiltro ? (total === 1 ? '1 resultado' : fmt(total) + ' resultados') : fmt(total) + ' documentos',
      ordemTexto: ORDEM_TEXTO[s.ordem][s.direcao === 'asc' ? 0 : 1],
      chips: chips,
      temChips: chips.length > 0,
      limparTudo: () => this.setState(Object.assign({ busca: '' }, limparFiltros)),

      gridCab: GRID_CAB + ' position: sticky; top: 0; z-index: 2; box-sizing: border-box; padding: 0 16px; height: 44px; background: #F8FAFC; border-bottom: 1px solid #E8EBF0;',
      paginaTexto: 'Página ' + fmt(pag) + ' de ' + fmt(nPag),
      colunas: colunas,
      linhas: linhas,
      vazio: total === 0,
      temPaginas: total > 0,
      faixa: total ? 'Mostrando ' + fmt(ini + 1) + '–' + fmt(Math.min(ini + porPag, total)) + ' de ' + fmt(total) + (total === 1 ? ' documento' : ' documentos') : 'Nenhum documento',
      porPagina: String(porPag),
      setPorPagina: (e) => this.setState({ porPagina: parseInt(e.target.value, 10), pag: 1 }),
      botoesPag: botoesPag,
      primeira: pag <= 1, ultima: pag >= nPag,
      estiloAnterior: seta(pag <= 1), estiloProxima: seta(pag >= nPag),
      pagAnterior: () => this.setState({ pag: Math.max(1, pag - 1) }),
      pagProxima: () => this.setState({ pag: Math.min(nPag, pag + 1) }),

      detalheAberto: s.ver != null && this.doSeq(s.ver).length > 0,
      det: det,
      fecharDetalhe: () => this.fecharDetalheSeguro(),
      fecharFundoDetalhe: (e) => { if (e.target === e.currentTarget) this.fecharDetalheSeguro(); },
      teclaModal: (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); this.fecharTopo(); } },

      formAberto: !!s.form || !!s.sucesso,
      formEditando: !s.sucesso,
      formCamada: 'display: flex; flex-direction: column; height: 100%;' + (s.sucesso ? ' visibility: hidden;' : ''),
      camadaClassif: 'grid-area: 1 / 1; min-width: 0; display: flex; flex-direction: column; gap: 12px;' + (revForm ? ' visibility: hidden;' : ''),
      camadaRevisao: 'grid-area: 1 / 1; min-width: 0; display: flex; flex-direction: column; gap: 12px;' + (revForm ? '' : ' visibility: hidden;'),
      semSigilo: s.acesso !== 'Informação classificada',
      estDet: (() => {
        var o = {};
        var dE = s.edDet ? this.doSeq(s.edDet.seq).find((x) => x.rev === s.edDet.rev) : null;
        var orig = (k) => (k === 'sigilo' ? (dE.acesso === 'Informação classificada' ? dE.sigilo : '') : (k === 'tituloDoc' ? (dE.titulo || '') : (k === 'emissao' ? isoBR(dE.emissao) : (dE[k] || ''))));
        ['status', 'fase', 'acesso', 'sigilo', 'ticket', 'sei'].forEach((k) => {
          var mudou = dE && String(s[k]).trim() !== orig(k);
          var bloqueado = (k === 'sigilo' && s.acesso !== 'Informação classificada') || (k === 'fase' && !!faseAuto(s.tipo));
          o[k] = 'width: 100%; min-width: 0; height: ' + (k === 'tituloDoc' ? '38px; font-size: 17px; font-weight: 700; padding: 0 10px;' : (k === 'autor' || k === 'ticket' || k === 'emissao' || k === 'sei' ? '34px; font-size: 13.5px; font-weight: 500; padding: 0 10px;' : '34px; font-size: 13.5px; font-weight: 500; padding: 0 6px;')) + ' border-radius: 8px; font-family: inherit; box-sizing: border-box; ' +
            (bloqueado ? 'background: #F5F7FA; color: #B2BAC4; border: 1px solid #E8EBF0; cursor: not-allowed;'
              : 'background: #FFFFFF; color: #1F2937; ' + (err[k] ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.12);' : (mudou ? 'border: 1px solid #9AD5B0; box-shadow: 0 0 0 3px rgba(46, 160, 90, 0.08);' : 'border: 1px solid #E08A8A; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.07);')));
        });
        o.seiCab = (o.sei || '').replace('width: 100%;', 'width: 200px;').replace('height: 34px;', 'height: 28px;');
        return o;
      })(),
      estDetComentario: (() => {
        var dE = s.edDet ? this.doSeq(s.edDet.seq).find((x) => x.rev === s.edDet.rev) : null;
        var mudou = dE && s.comentario.trim() !== (dE.comentario || '');
        return 'display: block; width: 100%; height: 108px; padding: 10px 12px; border-radius: 8px; font: inherit; font-size: 14px; line-height: 1.5; color: #1F2937; background: #FFFFFF; resize: none; box-sizing: border-box; overflow-y: auto; ' +
          (mudou ? 'border: 1px solid #9AD5B0; box-shadow: 0 0 0 3px rgba(46, 160, 90, 0.08);' : 'border: 1px solid #E08A8A; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.07);');
      })(),
      estSigiloF: est.sigilo + (s.acesso === 'Informação classificada' ? '' : ' background: #F5F7FA; color: #B2BAC4; border-color: #E8EBF0; cursor: not-allowed;'),
      estComentarioF: 'display: block; width: 100%; height: 108px; padding: 10px 12px; border-radius: 8px; font: inherit; font-size: 14px; line-height: 1.5; color: #1F2937; background: #FFFFFF; resize: none; box-sizing: border-box; overflow-y: auto; ' + contorno(s.comentario),
      semDuplicado: !dupDoc,
      arqDica: s.erroArq || (err.arquivo ? 'Escolha o arquivo que será incluído.' : 'PDF, DWG, DXF, DWF, RVT, IFC, SKP, DOC(X), XLS(X), JPG, PNG, TIF, KMZ ou ZIP · um arquivo por documento'),
      arqDicaEstilo: 'font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (s.erroArq || err.arquivo ? '#B42318;' : '#667080;'),
      formNovo: !!s.form && !revForm,
      formRevisao: revForm,
      formTitulo: revForm ? 'Incluir Revisão' : 'Incluir Novo Documento',
      formSubtitulo: revForm ? 'A classificação é mantida. Envie o arquivo e atualize a situação.' : 'O nome do arquivo é gerado automaticamente a partir da classificação.',
      formRev: dRev ? { seq: this.pad(dRev.seq), codigo: this.base(dRev), titulo: this.titulo(dRev), predio: nomePredio(dRev.predio) + (USOS[dRev.predio.split('-')[1]] ? ' · ' + USOS[dRev.predio.split('-')[1]] : ''), disc: DISCS[dRev.disc] || dRev.disc, tipo: TIPOS[dRev.tipo] || dRev.tipo, sis: nomeSis(dRev.disc, dRev.sis), atual: this.revTxt(revF - 1), nova: this.revTxt(revF), vigenteInfo: this.revTxt(revF - 1) + ' · ' + dRev.status } : { seq: '', codigo: '', titulo: '', predio: '', disc: '', tipo: '', sis: '', atual: '', nova: '', vigenteInfo: '' },
      fecharForm: () => this.setState({ form: null, tentou: false, sucesso: null }),
      fecharFundoForm: (e) => { if (e.target === e.currentTarget) this.setState({ form: null, tentou: false, sucesso: null }); },
      dropEstilo: 'position: relative; display: flex; align-items: center; gap: 12px; height: 72px; padding: 0 16px; box-sizing: border-box; border-radius: 10px; ' +
        (s.drag ? 'border: 1.5px dashed #5A6370; background: #F1F2F4;' : (err.arquivo || s.erroArq ? 'border: 1.5px dashed #B42318; background: #FEF6F5;' : (s.file ? (dupDoc && !s.dupOk ? 'border: 1px solid #E8C77A; background: #FFFBF2;' : 'border: 1px solid #9AD5B0; background: #F7FCF9;') : 'border: 1.5px dashed #CDD4DE; background: #FAFBFC;'))),
      onDragOver: (e) => { e.preventDefault(); if (!this.state.drag) this.setState({ drag: true }); },
      onDragLeave: () => this.setState({ drag: false }),
      onDrop: (e) => { e.preventDefault(); this.takeFile(e.dataTransfer.files[0]); },
      onFile: (e) => { this.takeFile(e.target.files[0]); e.target.value = ''; },
      semArquivo: !s.file, temArquivo: !!s.file,
      arqNome: s.file ? s.file.nome : '', arqExt: s.file ? s.file.ext : '', arqExtEstilo: s.file ? this.extEstilo(s.file.ext, true) : '',
      arqTamanho: s.file ? this.fmtSize(s.file.size) : '',
      erroArq: !!s.erroArq || err.arquivo,
      erroArqTexto: s.erroArq || 'Escolha o arquivo que será incluído.',
      cp: this.combo('predio', 'predio', null, est.predio),
      sis: s.sis, disc: s.disc, tipo: s.tipo,
      faseFixa: !!faseAuto(s.tipo), faseProj: !!s.tipo && !faseAuto(s.tipo),
      estFase: est.fase + (faseAuto(s.tipo) ? ' background: #F5F7FA; color: #667080; border: 1px solid #E8EBF0; box-shadow: none; cursor: not-allowed;' : ''),
      faseDica: faseAuto(s.tipo) ? 'Definida pelo tipo de documento' : '',
      semDisc: !s.disc,
      sisPh: s.disc ? 'Selecione' : 'Escolha a disciplina',
      sisOpcoes: s.disc ? (SIS_ORDEM[s.disc] || []).map((k) => ({ v: k, t: SISTEMAS[s.disc][k] + (SIS_DICA[s.disc] && SIS_DICA[s.disc][k] ? ' (' + SIS_DICA[s.disc][k] + ')' : ''), sep: false })) : [],
      estSis: est.sis + (s.disc ? '' : ' background: #F5F7FA; color: #B2BAC4; border-color: #E8EBF0; cursor: not-allowed;'),
      setSis: setF('sis'), fase: s.fase, status: s.status, acesso: s.acesso, sigilo: s.sigilo,
      setDisc: (e) => { var v = e.target.value; this.setState({ disc: v, sis: SISTEMAS[v] && SISTEMAS[v][this.state.sis] ? this.state.sis : '', avisoEd: '' }); }, setTipo: (e) => {
        var t = e.target.value, st = this.state, o = { tipo: t, avisoEd: '' };
        var fa = faseAuto(t);
        if (fa) o.fase = fa; else if (['OBR', 'MAN', 'NA'].indexOf(st.fase) >= 0) o.fase = '';
        if (st.form && st.form.modo !== 'novo' && !st.statusMexido) o.status = statusPadrao(t);
        this.setState(o);
      },
      setFase: setF('fase'), setStatus: (e) => this.setState({ status: e.target.value, statusMexido: true, avisoEd: '' }), setSigilo: setF('sigilo'),
      tituloDoc: s.tituloDoc, autor: s.autor, ticket: s.ticket, emissao: s.emissao,
      setTituloDoc: (e) => this.setState({ tituloDoc: e.target.value.slice(0, 160) }),
      setAutor: (e) => this.setState({ autor: e.target.value.slice(0, 80) }),
      setTicket: (e) => this.setState({ ticket: e.target.value.replace(/[^0-9A-Za-z./-]/g, '').slice(0, 24) }),
      sei: s.sei, setSei: (e) => this.setState({ sei: e.target.value.replace(/[^0-9./-]/g, '').slice(0, 24) }),
      setEmissao: (e) => this.setState({ emissao: e.target.value }),
      setAcesso: (e) => this.setState({ acesso: e.target.value, sigilo: '', avisoEd: '' }),
      classificada: s.acesso === 'Informação classificada',
      est: est, err: err,
      comentario: s.comentario,
      setComentario: (e) => this.setState({ comentario: e.target.value.slice(0, 500), avisoEd: '' }),
      contadorComentario: s.comentario.length + '/500',
      contadorJust: (s.justificativa || '').length + '/300',
      predioSel: s.predio,
      setPredioSel: (e) => { var v = e.target.value; this.setState({ predio: v, predioTxt: PREDIOS[v] || '', avisoEd: '' }); },
      predioOpcoes: s.edDet && s.edDet.modo === 'classif' ? PREDIO_LISTA.map((p) => ({ v: p.cod, t: nomePredio(p.cod) + ' (' + p.cod + ')' })) : [],
      discOpcoes: Object.keys(DISCS).map((k) => ({ v: k, t: DISCS[k] })),
      tipoGrupos: NATUREZAS.map((n) => ({ nome: n, itens: Object.keys(TIPOS).filter((k) => NATUREZA[k] === n).map((k) => ({ v: k, t: TIPOS[k] })) })),
      estC: (() => {
        var o = {};
        var dE = s.edDet && s.edDet.modo === 'classif' ? this.doSeq(s.edDet.seq).find((x) => x.rev === s.edDet.rev) : null;
        ['predio', 'disc', 'sis', 'tipo'].forEach((k) => {
          var mudou = dE && s[k] !== dE[k];
          var bloq = k === 'sis' && !s.disc;
          o[k] = 'width: 100%; min-width: 0; height: 34px; font-size: 13.5px; font-weight: 500; padding: 0 6px; border-radius: 8px; font-family: inherit; box-sizing: border-box; ' +
            (bloq ? 'background: #F5F7FA; color: #B2BAC4; border: 1px solid #E8EBF0; cursor: not-allowed;'
              : 'background: #FFFFFF; color: #1F2937; ' + (err[k] ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.12);' : (mudou ? 'border: 1px solid #9AD5B0; box-shadow: 0 0 0 3px rgba(46, 160, 90, 0.08);' : 'border: 1px solid #E08A8A; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.07);')));
        });
        return o;
      })(),
      estJustDet: 'display: block; width: 100%; height: 108px; padding: 10px 12px; border-radius: 8px; font: inherit; font-size: 14px; line-height: 1.5; color: #1F2937; background: #FFFFFF; resize: none; box-sizing: border-box; overflow-y: auto; ' +
        (err.justificativa ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.12);' : ((s.justificativa || '').trim().length >= 10 ? 'border: 1px solid #9AD5B0; box-shadow: 0 0 0 3px rgba(46, 160, 90, 0.08);' : 'border: 1px solid #E08A8A; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.07);')),
      placeholderComentario: revForm ? 'O que mudou nesta revisão? Ex.: compatibilização com a climatização e correção de cotas.' : 'Ex.: 3º pavimento, ala norte: quadro de distribuição e circuitos das salas de audiência',
      nomePartes: nomePartes,
      temAvisoForm: s.tentou && !!s.form && (nFalta > 0 || (!!dupDoc && !s.dupOk)),
      avisoFormTexto: s.tentou && !!s.form && (nFalta > 0 || (!!dupDoc && !s.dupOk)) ? (nFalta > 0 ? (nFalta === 1 ? 'Falta 1 campo obrigatório, destacado em vermelho.' : 'Faltam ' + nFalta + ' campos obrigatórios, destacados em vermelho.') : 'Arquivo idêntico a um do acervo: confirme ou troque o arquivo.') : '',
      avisoForm: nFalta > 0 ? (nFalta === 1 ? 'Falta 1 campo obrigatório.' : 'Faltam ' + nFalta + ' campos obrigatórios.') : 'Este arquivo já existe no acervo: confirme ou troque o arquivo.',
      temDuplicado: !!dupDoc,
      dup: dupDoc ? {
        nome: this.nomeDe(dupDoc), ok: s.dupOk,
        textoConfirmar: s.dupOk ? 'Confirmado · desfazer' : 'Incluir mesmo assim',
        ver: () => this.setState({ form: null, tentou: false, ver: dupDoc.seq, sel: dupDoc.seq, verRev: dupDoc.rev }),
        confirmar: () => this.setState({ dupOk: !this.state.dupOk })
      } : { nome: '', ok: false, textoConfirmar: '', ver: () => {}, confirmar: () => {} },
      temParecidos: parec.length > 0,
      parecidosTitulo: 'Neste prédio há ' + (parec.length === 1 ? '1 documento' : fmt(parec.length) + ' documentos') + ' com a mesma disciplina e tipo.',
      verParecidos: !!s.verParecidos,
      veioDeNovo: !!(s.form && s.form.deNovo),
      voltarParaNovo: () => { var dn = this.state.form.deNovo; this.setState(Object.assign({ form: { modo: 'novo', seq: null }, tentou: false }, dn)); },
      textoParecidos: s.verParecidos ? 'Ocultar' : 'Ver lista',
      alternarParecidos: () => this.setState({ verParecidos: !this.state.verParecidos }),
      temMaisParecidos: parec.length > 5,
      maisParecidos: 'E mais ' + fmt(parec.length - 5) + '. Para ver todos, use a pesquisa com os mesmos filtros.',
      parecidos: parec.slice(0, 5).map((g) => ({
        seq: this.pad(g.seq),
        descricao: g.coment || 'Sem descrição',
        sub: this.revTxt(g.ult) + ' · ' + g.d.status + ' · ' + FASES[g.d.fase] + ' · ' + g.d.data,
        revisar: () => this.virarRevisao(g.seq)
      })),
      botaoSalvar: revForm ? 'Incluir revisão' : 'Incluir documento',
      salvar: () => this.salvar(),

      edInfoAberto: !!s.edicao && s.edicao.tipo === 'info',
      edClassifAberto: !!s.edicao && s.edicao.tipo === 'classif',
      edSubtitulo: edDoc ? this.pad(s.edicao.seq) + ' · ' + this.titulo(edDoc) + ' · revisão ' + this.revTxt(s.edicao.rev) : '',
      clSubtitulo: edDoc ? 'Documento ' + this.pad(s.edicao.seq) + ' · ' + nRevEd + (nRevEd === 1 ? ' revisão' : ' revisões') + ' e ' + nArqEd + (nArqEd === 1 ? ' arquivo' : ' arquivos') + ' serão renomeados' : '',
      clAntes: edDoc ? this.base(edDoc) : '',
      clDepois: s.edicao ? [s.predio || '—', s.disc || '—', s.sis || '—', s.tipo || '—', this.pad(s.edicao.seq)].join('-') : '',
      justificativa: s.justificativa,
      setJustificativa: (e) => this.setState({ justificativa: e.target.value, avisoEd: '' }),
      estJust: 'padding: 10px 12px; border-radius: 8px; font: inherit; font-size: 14px; line-height: 1.5; color: #1F2937; background: #FFFFFF; resize: vertical; box-sizing: border-box; width: 100%; ' +
        (err.justificativa ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.1);' : contorno(s.justificativa)),
      estComentario: area_ + contorno(s.comentario),
      estLoginUsuario: 'height: 42px; padding: 0 12px 0 38px; border-radius: 10px; font: inherit; font-size: 14px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; width: 100%; ' + (s.loginErro && !s.loginUsuario.trim() ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.1);' : contorno(s.loginUsuario)),
      estLoginSenha: 'height: 42px; padding: 0 44px 0 38px; border-radius: 10px; font: inherit; font-size: 14px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; width: 100%; ' + (s.loginErro && !s.loginSenha ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.1);' : contorno(s.loginSenha)),
      edTemAviso: !!s.avisoEd || (s.tentou && !!s.edicao && nFalta > 0),
      edAviso: s.avisoEd || (nFalta === 1 ? 'Preencha o campo destacado.' : 'Preencha os ' + nFalta + ' campos destacados.'),
      salvarInfo: () => this.salvarInfo(),
      salvarClassif: () => this.salvarClassif(),
      fecharEd: () => this.setState({ edicao: null, tentou: false, avisoEd: '' }),
      fecharFundoEd: (e) => { if (e.target === e.currentTarget) this.setState({ edicao: null, tentou: false, avisoEd: '' }); },

      sigiloAberto: !!s.sigilo,
      sig: s.sigilo ? {
        codigo: s.sigilo.codigo,
        texto: 'Este documento é classificado como informação sigilosa' + (s.sigilo.grau && s.sigilo.grau !== 'Não se aplica' ? ' (grau ' + s.sigilo.grau.toLowerCase() + ')' : '') + ' e não pode ser baixado pelo acervo. Para ter acesso, solicite ' + CONTATO_SIGILO + '.',
        copiar: () => this.copiar(s.sigilo.codigo)
      } : { codigo: '', texto: '', copiar: () => {} },
      fecharSigilo: () => this.setState({ sigilo: null }),
      fecharFundoSigilo: (e) => { if (e.target === e.currentTarget) this.setState({ sigilo: null }); },
      exclusaoAberta: !!s.exclusao,
      exc: (() => {
        var e = s.exclusao;
        if (!e) return { titulo: '', docTitulo: '', codigo: '', temOpcoes: false, opcoes: [], motivo: '', setMotivo: () => {}, estMotivo: '', erro: false, info: '', botao: '', confirmar: () => {} };
        var lst = this.doSeq(e.seq); var u = this.maxRev(e.seq); var d0 = lst.find((x) => x.rev === u) || lst[0];
        var nR = new Set(lst.map((x) => x.rev)).size;
        var opc = (k, rot, dica) => ({
          sel: e.alvo === k, rotulo: rot, dica: dica,
          escolher: () => this.setState({ exclusao: Object.assign({}, this.state.exclusao, { alvo: k }) }),
          estilo: 'display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; font: inherit; cursor: pointer; ' + (e.alvo === k ? 'border: 1px solid #5A6370; background: #F4F6F7;' : 'border: 1px solid #E8EBF0; background: #FFFFFF;'),
          marca: 'flex: none; width: 16px; height: 16px; border-radius: 50%; box-sizing: border-box; ' + (e.alvo === k ? 'border: 5px solid #5A6370;' : 'border: 1.5px solid #B2BAC4;')
        });
        var erro = e.tentou && e.motivo.trim().length < 10;
        return {
          titulo: e.alvo === 'doc' ? 'Excluir Documento' : 'Excluir Revisão ' + this.revTxt(u),
          docTitulo: this.titulo(d0) + ' · ' + nomePredio(d0.predio), codigo: this.base(d0),
          temOpcoes: nR > 1,
          opcoes: nR > 1 ? [opc('rev', 'Só a última revisão (' + this.revTxt(u) + ')', 'Para revisão incluída por engano. A anterior volta a valer.'), opc('doc', 'O documento inteiro', 'Todas as ' + nR + ' revisões e seus arquivos.')] : [],
          motivo: e.motivo, erro: erro,
          setMotivo: (ev) => this.setState({ exclusao: Object.assign({}, this.state.exclusao, { motivo: ev.target.value.slice(0, 300) }) }),
          estMotivo: 'width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; font: inherit; font-size: 14px; line-height: 1.5; color: #1F2937; background: #FFFFFF; resize: none; ' + (erro ? 'border: 1px solid #B42318; box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.1);' : 'border: 1px solid #D8DEE5;'),
          info: (e.alvo === 'doc' ? 'O documento sai da pesquisa e vai para a lixeira. ' : 'A revisão sai da lista e vai para a lixeira. ') + 'O gestor pode restaurar depois, e o histórico registra quem excluiu e por quê. O número sequencial não é reaproveitado.',
          botao: e.alvo === 'doc' ? 'Excluir documento' : 'Excluir revisão',
          confirmar: () => this.confirmarExclusao()
        };
      })(),
      fecharExclusao: () => this.setState({ exclusao: null }),
      fecharFundoExclusao: (e) => { if (e.target === e.currentTarget) this.setState({ exclusao: null }); },
      lixeiraAberta: !!s.lixeira,
      nLixeira: (() => { var k = new Set(); s.docs.forEach((x) => { if (x.excluido) k.add(x.seq + ':' + x.excluido.ts); }); return k.size ? String(k.size) : ''; })(),
      abrirLixeira: () => this.setState({ lixeira: true, menuConta: false }),
      fecharLixeira: () => this.setState({ lixeira: false }),
      fecharFundoLixeira: (e) => { if (e.target === e.currentTarget) this.setState({ lixeira: false }); },
      lix: (() => {
        if (!s.lixeira) return { vazia: false, itens: [] };
        var mapa = new Map();
        s.docs.forEach((x) => { if (!x.excluido) return; var k = x.seq + ':' + x.excluido.ts; if (!mapa.has(k)) mapa.set(k, x); });
        var hh = (n) => String(n).padStart(2, '0');
        var itens = Array.from(mapa.values()).sort((a, b) => b.excluido.ts - a.excluido.ts).map((x) => {
          var m = x.excluido, dt = new Date(m.ts);
          return {
            alvo: m.alvo === 'doc' ? 'Documento' : 'Revisão ' + this.revTxt(m.rev),
            titulo: this.titulo(x) + ' · ' + (PREDIOS[x.predio] || x.predio), codigo: this.base(x) + (m.alvo === 'rev' ? '-' + this.revTxt(m.rev) : ''),
            motivo: m.motivo, por: m.por || '—',
            quando: hh(dt.getDate()) + '/' + hh(dt.getMonth() + 1) + '/' + dt.getFullYear() + ' às ' + hh(dt.getHours()) + ':' + hh(dt.getMinutes()),
            restaurar: () => this.restaurar(x.seq, m.ts)
          };
        });
        return { vazia: !itens.length, itens: itens };
      })(),
      loginAberto: s.login,
      loginTexto: s.loginMotivo ? s.loginMotivo + ' Use seu usuário e senha da rede do TJRS.' : 'Use seu usuário e senha da rede do TJRS. A consulta continua livre, sem entrar.',
      tipoSenha: s.verSenha ? 'text' : 'password', senhaOculta: !s.verSenha, senhaVisivel: !!s.verSenha,
      rotuloVerSenha: s.verSenha ? 'Ocultar senha' : 'Mostrar senha',
      alternarSenha: () => this.setState({ verSenha: !this.state.verSenha }),
      loginErroUsuario: !!s.loginErro && !s.loginUsuario.trim(), loginErroSenha: !!s.loginErro && !s.loginSenha,
      abrirLogin: () => { this._apos = null; this.setState({ login: true, loginErro: '', loginMotivo: '', menuConta: false }); },
      fecharLogin: () => { this._apos = null; this.setState({ login: false }); },
      fecharFundoLogin: (e) => { if (e.target === e.currentTarget) { this._apos = null; this.setState({ login: false }); } },
      loginUsuario: s.loginUsuario, loginSenha: s.loginSenha, loginPerfil: s.loginPerfil,
      setLoginUsuario: (e) => this.setState({ loginUsuario: e.target.value, loginErro: '' }),
      setLoginSenha: (e) => this.setState({ loginSenha: e.target.value, loginErro: '' }),
      setLoginPerfil: (e) => this.setState({ loginPerfil: e.target.value }),
      teclaLogin: (e) => { if (e.key === 'Enter') this.entrar(); },
      temLoginErro: !!s.loginErro, loginErro: s.loginErro,
      entrar: () => this.entrar(),

      sucessoAberto: !!s.sucesso,
      suc: s.sucesso ? Object.assign({}, s.sucesso, {
        extEstilo: this.extEstilo(s.sucesso.ext),
        abrir: () => this.setState({ sucesso: null, form: null, ver: s.sucesso.seq, verRev: null }),
        copiar: () => this.copiar(s.sucesso.nome),
        outro: () => { var su = this.state.sucesso; this.setState({ sucesso: null }); this.abrirForm('novo'); this.setState({ predio: su.predio, predioTxt: PREDIOS[su.predio] || su.predio }); }
      }) : { titulo: '', descricao: '', nome: '', ext: '', extEstilo: '', abrir: () => {}, copiar: () => {}, outro: () => {} },
      fecharSucesso: () => this.setState({ sucesso: null, form: null }),
      fecharFundoSucesso: (e) => { if (e.target === e.currentTarget) this.setState({ sucesso: null }); },

      infoAberto: s.info,
      abrirInfo: () => this.setState({ info: true, menuConta: false }),
      fecharInfo: () => this.setState({ info: false }),
      fecharFundoInfo: (e) => { if (e.target === e.currentTarget) this.setState({ info: false }); },

      toastVisivel: false, toast: '',
      flash: (() => {
        var f = s.flash;
        var onde = s.sigilo ? 'sigilo' : (s.lixeira ? 'lixeira' : (s.sucesso ? 'sucesso' : (s.form ? 'form' : (s.ver != null ? 'det' : 'pagina'))));
        var o = { msg: f ? f.msg : '', ok: !!f && !f.alerta, alerta: !!f && f.alerta,
          estilo: 'display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; font-size: 13px; font-weight: 600; white-space: nowrap; color: ' + (f && f.alerta ? '#774700' : '#17643A') + '; animation: ' + (f && f.n % 2 ? 'avisoSomeA' : 'avisoSomeB') + ' 3.6s ease forwards;' };
        ['det', 'pagina', 'lixeira', 'form', 'sucesso', 'sigilo'].forEach((k) => { o[k] = !!f && onde === k; });
        return o;
      })(),
    };
  }
}

/* inicia a aplicação */
document.addEventListener("DOMContentLoaded", function () {
  window.acervo = Motor.montar(document.getElementById("app"), document.getElementById("tela").textContent, Component);
});
