# Acervo Técnico de Engenharia

Sistema web para guardar, classificar e consultar os documentos técnicos de engenharia dos prédios do **TJRS**: pranchas, memoriais, laudos, ARTs, atas e outros. Foi feito para o **DIPRED-DMAN**.

Cada documento recebe um código padronizado, tem controle de revisões (R00, R01…), nível de acesso e sigilo, histórico de alterações e lixeira. Os arquivos ficam numa estrutura de pastas no servidor, organizada por prédio e disciplina.

---

## Funcionalidades

- **Consulta e download** do acervo com filtros por prédio, disciplina, assunto, tipo, etapa e status. Não precisa de login.
- **Inclusão de documentos e revisões** com envio do arquivo (até 200 MB). O sistema gera o nome do arquivo e calcula o hash SHA-256.
- **Controle de revisões**: só uma revisão fica **Aprovado** (a vigente). Quando uma revisão nova é aprovada, as anteriores passam para **Substituído**. O número de revisão nunca é reaproveitado.
- **Acesso e sigilo**: Público, Acesso controlado ou Informação classificada (Reservada, Secreta ou Ultrassecreta). Só o gestor baixa documentos classificados.
- **Edição** das informações de uma revisão: status, etapa, descrição, ticket e acesso.
- **Correção de classificação** (gestor): troca prédio, disciplina, assunto ou tipo, e o sistema renomeia e move os arquivos de todas as revisões.
- **Lixeira** (gestor): exclui o documento inteiro ou a última revisão, com motivo obrigatório, e permite restaurar depois.
- **Histórico**: guarda quem fez o quê e quando em cada documento.

## Perfis de usuário

| Perfil      | Pode fazer                                                              |
|-------------|-------------------------------------------------------------------------|
| *(sem login)* | Consultar o acervo e baixar documentos que não são classificados       |
| **TECNICO** | Tudo o que o anônimo faz, mais incluir documentos e revisões e editar informações |
| **GESTOR**  | Tudo o que o técnico faz, mais corrigir classificação, excluir, restaurar da lixeira e baixar documentos classificados |

## Codificação dos documentos

O nome do arquivo é gerado pelo sistema a partir da classificação:

```
PRÉDIO - DISCIPLINA - ASSUNTO - TIPO - SEQUENCIAL - REVISÃO . extensão

POA-F-1-ELE-ILU-PRA-00007-R01.pdf
│       │   │   │   │     └─ revisão 01
│       │   │   │   └─ documento nº 7 (sequencial único do acervo)
│       │   │   └─ Prancha
│       │   └─ Iluminação e tomadas
│       └─ Elétrica
└─ prédio (CIDADE-USO-N)
```

Os catálogos são carregados pelo script do banco:

- **Disciplinas**: Arquitetura (ARQ), Civil (CIV), Elétrica (ELE), Telecomunicações (TEL) e Mecânica (MEC).
- **Assuntos** por disciplina, por exemplo: EDI, LAY, EST, ENE, ILU, SPDA, LOG, CFTV, CLI, GMG…
- **Tipos de documento**: Prancha, Memorial, Memória de cálculo, Laudo, ART/RRT, Ata, Ofício e outros. Os tipos de registro (ATA, OF, ART, etc.) já entram como Aprovado.
- **Etapas**: Estudo Preliminar, Anteprojeto, Projeto Básico, Projeto Executivo, Obra, As Built, Uso e Manutenção.
- **Prédios** do TJRS, com o código e o número do imóvel.

## Tecnologias

| Camada     | Tecnologia                                                      |
|------------|-----------------------------------------------------------------|
| Back-end   | Java 17, Spring Boot 4 (Web MVC, Data JPA, Security, Validation), Lombok |
| Banco      | MySQL 8 (H2 em memória nos testes automáticos)                  |
| Front-end  | HTML, CSS e JavaScript puro, com Bootstrap 5.3 (página única)  |
| Build      | Maven (wrapper `mvnw` incluído)                                 |
| Segurança  | HTTP Basic sem sessão, senhas com BCrypt                        |

## Estrutura do projeto

```
acervo-tecnico-engenharia/
├── db/
│   ├── dipred_acervo_db.sql        criação do banco, das tabelas e carga dos catálogos
│   └── dipred_acervo_teste.sql     usuários e documentos de exemplo (não usar em produção)
├── Estrutura de Pastas/            raiz onde ficam os arquivos do acervo (ver LEIA-ME.txt)
├── front-end/                      protótipo original da tela (HTML/CSS/JS)
├── src/main/java/tjrs/dipred/acervo/
│   ├── config/                     segurança e tratamento de erros da API
│   ├── controller/                 endpoints REST
│   ├── dto/                        objetos trocados com a tela
│   ├── model/                      entidades JPA
│   ├── repository/                 acesso ao banco
│   ├── security/                   carga dos usuários para o login
│   └── service/                    regras do acervo, arquivos e configuração inicial
├── src/main/resources/
│   ├── application.properties
│   ├── application-local.properties.exemplo
│   └── static/                     tela servida pelo Spring Boot
└── src/test/                       testes automáticos (fluxo completo com H2)
```

## Armazenamento dos arquivos

Os arquivos **não ficam no banco de dados**. O banco guarda só o diretório (relativo à raiz) e o nome do arquivo. A raiz é definida em `acervo.arquivos.raiz`.

```
<raiz>/
├── acervo/<PRÉDIO>/<DISCIPLINA>/   arquivos do acervo, já renomeados
└── temporario/                     recebimento dos envios (o arquivo sai daqui ao gravar)
```

Quando o sistema inicia, ele confere essa estrutura e cria as pastas que faltam (por exemplo, quando um prédio novo é cadastrado).

> ⚠️ Não renomeie nem mova arquivos à mão. O caminho está gravado no banco.

## Como executar

### Pré-requisitos

- JDK 17 ou superior
- MySQL 8

### 1. Criar o banco

No MySQL, crie o usuário da aplicação e rode o script como `root`:

```sql
CREATE USER 'dipred_user'@'localhost' IDENTIFIED BY 'sua_senha';
```

```bash
mysql -u root -p < db/dipred_acervo_db.sql
```

O script pode ser executado mais de uma vez sem apagar dados. Para testar, você pode carregar também os dados de exemplo:

```bash
mysql -u root -p < db/dipred_acervo_teste.sql
```

Isso cria os usuários `gestor.teste` e `tecnico.teste`, ambos com a senha `teste123`.

### 2. Configurar a máquina

Copie o modelo e preencha as senhas. Esse arquivo fica fora do Git.

```bash
cp src/main/resources/application-local.properties.exemplo src/main/resources/application-local.properties
```

```properties
spring.datasource.username=dipred_user
spring.datasource.password=SENHA_DO_MYSQL

# Senha do gestor "admin", criado na primeira execução
acervo.admin.senha-inicial=SENHA_DO_ADMIN

# No servidor, apontar para a pasta definitiva dos arquivos
# acervo.arquivos.raiz=D:/Acervo Tecnico
```

Também dá para usar as variáveis de ambiente `DB_USER`, `DB_PASSWORD` e `ACERVO_ADMIN_SENHA`.

### 3. Rodar

```bash
./mvnw spring-boot:run        # Linux/macOS
mvnw.cmd spring-boot:run      # Windows
```

Abra **http://localhost:8083**. Na primeira execução, o sistema cria o usuário gestor `admin` com a senha definida em `acervo.admin.senha-inicial`.

### Testes

Os testes usam H2 em memória e não precisam do MySQL:

```bash
./mvnw test
```

### Gerar o pacote para o servidor

```bash
./mvnw clean package
java -jar target/acervo-0.0.1-SNAPSHOT.jar
```

## API REST

| Método | Endpoint                                         | Acesso      | Descrição                                    |
|--------|--------------------------------------------------|-------------|----------------------------------------------|
| POST   | `/api/auth/login`                                | público     | Confere usuário e senha e devolve o perfil   |
| GET    | `/api/catalogos`                                 | público     | Prédios, disciplinas, assuntos, tipos e etapas |
| GET    | `/api/acervo`                                    | público     | Todas as revisões e o histórico              |
| GET    | `/api/documentos/{seq}/revisoes/{rev}/arquivo`   | público*    | Download do arquivo da revisão               |
| POST   | `/api/documentos`                                | técnico     | Inclui documento novo (multipart)            |
| POST   | `/api/documentos/{seq}/revisoes`                 | técnico     | Inclui nova revisão (multipart)              |
| PUT    | `/api/documentos/{seq}/revisoes/{rev}`           | técnico     | Edita as informações da revisão              |
| PUT    | `/api/documentos/{seq}/classificacao`            | gestor      | Corrige a classificação (renomeia e move os arquivos) |
| POST   | `/api/documentos/{seq}/exclusoes`                | gestor      | Manda o documento ou a última revisão para a lixeira |
| POST   | `/api/exclusoes/{id}/restauracao`                | gestor      | Restaura da lixeira                          |

\* Documentos classificados e itens na lixeira só podem ser baixados pelo gestor.

A autenticação é por **HTTP Basic** (`Authorization: Basic ...`). Os erros voltam em JSON no formato `{"erro": "mensagem"}`.

## Implantação

O sistema vai rodar num **servidor local da rede cabeada do TJRS, sem acesso à internet**. Pendências conhecidas:

- [ ] Servir Bootstrap e fontes localmente (hoje vêm de CDN / Google Fonts).
- [ ] Integrar o login com o AD/SSO do TJRS, que depende de dados da TI.

---

**DIPRED-DMAN · Tribunal de Justiça do Estado do Rio Grande do Sul**
