# Prompt mestre — evolução do Detalha para plataforma de leitura de projetos e tour 3D

## Papel

Você é o engenheiro principal de software e arquiteto de uma plataforma para arquitetura e móveis planejados. Trabalhe diretamente no repositório `ppedroandrade/detalha` e implemente a evolução descrita neste documento. Analise o código antes de alterar qualquer coisa, preserve as funções existentes e avance de forma incremental até entregar um MVP executável e verificável.

Existe um segundo repositório, `ppedroandrade/ap1806-tour`, que contém uma prova de conceito de tour 3D em Three.js. Use-o como referência para câmera, navegação, colisões, teleporte, tour guiado e interação com objetos. Esse repositório é privado e contém material de um apartamento real. Extraia somente conceitos e componentes genéricos. Não copie plantas, imagens, medidas, nomes ou outros dados particulares para o repositório público `detalha`.

## Contexto real do repositório

O `detalha` já é um portal de marcenaria construído com:

- Next.js 15 com App Router;
- React 19 e TypeScript estrito;
- Tailwind CSS;
- componentes próprios em `components/`;
- administração de clientes e projetos;
- ambientes e itens do apartamento;
- medidas, marca, modelo, código, voltagem e acabamento;
- requisitos elétricos, hidráulicos e de recorte;
- pendências para a marcenaria;
- visualização consolidada para a equipe;
- exportação para Excel;
- dados demonstrativos e persistência atual em `localStorage`.

Arquivos centrais já existentes:

- `components/platform-app.tsx`: seleciona login, painel administrativo e projeto;
- `components/admin-dashboard.tsx`: carteira de clientes e projetos;
- `components/apartment-app.tsx`: dashboard, ambientes, itens e visão da equipe;
- `hooks/use-platform.ts` e `hooks/use-apartment-data.ts`: regras atuais de estado;
- `lib/storage.ts`: persistência local e sessão demonstrativa;
- `lib/types.ts`: contratos principais;
- `lib/seed.ts`: demonstração atual.

A interface atual possui identidade visual consistente, com as marcas Morada/Detalha, cores `ink`, `brand`, `sage`, tipografia DM Sans/Fraunces e componentes reutilizáveis. Preserve essa linguagem.

## Objetivo do produto

Transformar o Detalha em uma plataforma na qual uma empresa de móveis, arquiteto ou projetista possa:

1. cadastrar cliente e projeto;
2. enviar plantas, projetos executivos, cadernos técnicos, cortes, elevações, fotos, lista de acabamentos e arquivos de mobiliário;
3. solicitar leitura assistida por IA;
4. receber ambientes, medidas, aberturas, móveis, materiais, instalações, conflitos e pendências extraídos dos documentos;
5. conferir cada informação com indicação do arquivo e da página de origem;
6. corrigir e aprovar os dados;
7. gerar uma cena 3D determinística em escala real;
8. abrir um tour navegável no computador, celular ou iPad;
9. compartilhar o projeto com o cliente;
10. manter as especificações atuais de compras e marcenaria conectadas ao ambiente e ao objeto correspondente no 3D.

## Princípios obrigatórios

- Os arquivos enviados são a fonte de verdade.
- Nunca invente medida para completar o modelo.
- Toda informação extraída precisa registrar arquivo, página e nível de confiança.
- Informações ausentes devem aparecer como pendência.
- Informações incompatíveis devem aparecer como conflito e não podem ser resolvidas silenciosamente.
- Uma hipótese visual deve ser armazenada como `assumption`, com justificativa, e permanecer diferente de um dado confirmado.
- O 3D só pode usar dados aprovados ou hipóteses explicitamente aceitas.
- A IA interpreta documentos e produz dados estruturados. A geometria final é criada por um motor determinístico.
- Todas as dimensões internas devem usar metros. Preserve o valor e a unidade original como evidência.
- Não faça alterações estéticas que mudem o tamanho dos ambientes.
- Não exponha chaves de API no cliente.
- Não grave senhas em texto puro.
- Não coloque dados, documentos ou imagens reais de clientes no Git.
- O sistema deve continuar útil quando a IA falhar: upload, revisão manual e edição precisam funcionar.
- Mantenha o modo demonstrativo local durante a migração, mas separe-o claramente do modo de produção.

## Escopo do MVP

Implemente primeiro um MVP completo para:

- PDF vetorial ou rasterizado;
- PNG e JPEG;
- múltiplos arquivos por projeto;
- extração assistida por IA;
- revisão humana obrigatória;
- geração de planta e tour 3D;
- compartilhamento por link autenticado ou token revogável.

Prepare interfaces para DXF, DWG, IFC, RVT, SKP e GLB, mas não prometa conversão completa desses formatos no primeiro MVP. IFC, DXF e GLB podem ser adicionados depois por adaptadores específicos. RVT, DWG e SKP devem ser tratados como formatos que podem exigir exportação prévia ou serviço externo.

## Jornada principal

### 1. Arquivos do projeto

Dentro de cada projeto, adicione a seção `Arquivos`.

Ela deve permitir:

- arrastar e soltar vários arquivos;
- mostrar nome, tipo, tamanho, data, autor e status;
- classificar o arquivo como planta, layout, corte, elevação, marcenaria, luminotécnico, acabamento, foto, memorial ou outro;
- corrigir manualmente a classificação;
- visualizar PDF e imagem;
- remover ou substituir arquivo preservando histórico;
- selecionar quais versões participam da próxima análise.

Status sugeridos:

- `uploaded`;
- `queued`;
- `processing`;
- `processed`;
- `needs_review`;
- `failed`;
- `archived`.

### 2. Leitura por IA

Adicione a seção `Leitura IA`.

O processamento deve:

1. validar arquivos;
2. extrair texto e vetores quando possível;
3. rasterizar páginas relevantes;
4. identificar a função de cada documento;
5. detectar escala e unidades;
6. extrair ambientes e áreas;
7. extrair paredes, portas, janelas, vãos e pé-direito;
8. extrair móveis, eletros, bancadas e instalações;
9. extrair materiais e acabamentos;
10. cruzar informações entre arquivos;
11. gerar conflitos, ausências e perguntas;
12. devolver JSON validado por schema;
13. persistir o resultado e as evidências;
14. nunca gerar diretamente o modelo final sem revisão.

Use processamento em duas camadas:

- uma passagem econômica para classificar páginas e localizar conteúdo;
- uma passagem mais forte apenas nas páginas técnicas relevantes ou contraditórias.

Crie uma abstração `DocumentIntelligenceProvider`. A implementação de produção pode usar a OpenAI Responses API com entradas multimodais e Structured Outputs. Crie também um `MockDocumentIntelligenceProvider` determinístico para desenvolvimento e testes sem chave.

### 3. Revisão e validação

Adicione a seção `Validação`, obrigatória antes do 3D.

Organize em abas:

- Ambientes;
- Paredes;
- Portas e janelas;
- Mobiliário;
- Acabamentos;
- Instalações;
- Conflitos;
- Pendências;
- Hipóteses.

Cada valor extraído deve exibir:

- valor normalizado;
- valor original;
- unidade;
- confiança;
- arquivo;
- página;
- trecho ou recorte da evidência;
- estado `pending`, `approved`, `edited` ou `rejected`;
- usuário e data da decisão.

Permita abrir o documento diretamente na página citada. Ao editar uma informação, mantenha o valor extraído para auditoria. Conflitos devem mostrar as alternativas lado a lado e exigir escolha ou novo valor manual.

Inclua um indicador de prontidão:

- dados estruturais completos;
- todas as dimensões obrigatórias aprovadas;
- conflitos críticos resolvidos;
- hipóteses aceitas;
- projeto liberado para modelagem.

### 4. Modelo 3D e tour

Adicione a seção `Tour 3D`.

Migre e generalize os conceitos do `ap1806-tour` para componentes React/Three.js reutilizáveis. Considere usar `three`, `@react-three/fiber` e `@react-three/drei`, desde que a integração permaneça estável no Next.js.

Requisitos:

- escala 1:1 em metros;
- eixo Y vertical e convenção de coordenadas documentada;
- paredes geradas a partir de segmentos ou polígonos aprovados;
- vãos reais para portas e janelas;
- pisos e forros por ambiente;
- alturas por ambiente;
- móveis paramétricos ou associados a modelos GLB;
- materiais PBR quando disponíveis;
- iluminação neutra quando a orientação solar não estiver confirmada;
- câmera em primeira pessoa a 1,60 m;
- WASD e setas no computador;
- mouse ou arraste para olhar;
- joystick e toque no iPad/celular;
- gesto de pinça na vista superior;
- colisão com paredes e objetos;
- vista de maquete;
- vista superior;
- teleporte para ambientes;
- tour guiado;
- botão para restaurar a cena;
- interação com objetos que possuam metadados apropriados;
- painel que conecte o objeto 3D ao item de marcenaria ou compra;
- estado de carregamento, recuperação de erro e aviso para WebGL incompatível.

A primeira versão pode usar objetos paramétricos simples e uma biblioteca pequena de GLBs genéricos. Qualquer objeto sem modelo fiel deve ser marcado visualmente como representação provisória.

Não use IA generativa para alterar dimensões. IA generativa 2D ou 3D pode sugerir objetos decorativos, mas esses objetos não podem substituir elementos técnicos.

### 5. Integração com os recursos atuais

Não descarte os ambientes e itens existentes.

Evolua os modelos para que:

- `Environment` possa se vincular a um `ExtractedRoom`;
- `ApartmentItem` tenha dimensões estruturadas além do texto livre;
- um item possa se vincular a um objeto da cena;
- requisitos elétricos, hidráulicos e recortes apareçam também no 3D;
- a visualização para equipe mostre a evidência técnica;
- a exportação para Excel inclua origem, página, confiança e estado de validação;
- o dashboard mostre progresso de documentos, validação e 3D.

Adicione ao menu do projeto:

- Visão geral;
- Arquivos;
- Leitura IA;
- Validação;
- Ambientes e itens;
- Tour 3D;
- Visualização para equipe.

## Modelo de dados mínimo

Modele no banco, com relacionamentos claros:

- `User`;
- `Organization`;
- `OrganizationMember`;
- `Client`;
- `Project`;
- `ProjectFile`;
- `ProjectFileVersion`;
- `ProcessingRun`;
- `ProcessingPage`;
- `ExtractedFact`;
- `SourceCitation`;
- `ExtractedRoom`;
- `Wall`;
- `Opening`;
- `FurnitureObject`;
- `MaterialSpecification`;
- `InstallationPoint`;
- `Conflict`;
- `MissingInformation`;
- `Assumption`;
- `ValidationDecision`;
- `SceneVersion`;
- `SceneObject`;
- `TourShare`;
- `AuditLog`.

Não force tabelas excessivamente genéricas quando um tipo explícito oferecer validação melhor. Use identificadores estáveis. Dados extraídos precisam ser versionados por execução; nunca sobrescreva silenciosamente um resultado anterior.

## Schema de saída da IA

Defina schemas Zod estritos para o resultado. O resultado deve conter, no mínimo:

- metadados dos documentos;
- unidades detectadas;
- orientação conhecida ou ausente;
- ambientes com nome, área e pé-direito;
- paredes com pontos, espessura e altura;
- portas com parede, posição, largura, altura e sentido de abertura;
- janelas com parede, posição, largura, altura e peitoril;
- móveis com ambiente, posição, rotação, largura, altura e profundidade;
- materiais com superfície, descrição, cor aproximada e referência comercial;
- pontos elétricos e hidráulicos;
- conflitos;
- informações faltantes;
- hipóteses;
- citações por valor;
- confiança por valor;
- resumo de prontidão.

Uma resposta fora do schema deve ser rejeitada e registrada como falha de processamento.

## Arquitetura recomendada

Mantenha o Next.js App Router.

Para produção, use:

- PostgreSQL;
- autenticação robusta;
- armazenamento privado compatível com S3 ou Supabase Storage;
- URLs assinadas;
- processamento assíncrono;
- API de IA apenas no servidor;
- logs estruturados;
- rastreamento de custo por execução;
- controle de limite por organização.

Uma combinação aceitável para o MVP é Supabase Auth + PostgreSQL + Storage, com rotas de servidor no Next.js. Se o processamento exceder os limites do provedor de hospedagem, isole workers em um serviço próprio. Crie interfaces para não acoplar a regra de negócio ao fornecedor.

Separe camadas:

- domínio e schemas;
- repositórios de dados;
- armazenamento de arquivos;
- provider de IA;
- extração determinística;
- resolução de conflitos;
- geração de cena;
- componentes 3D;
- interface web.

## Segurança e privacidade

Corrija as limitações da demonstração atual:

- substituir senha em texto puro por autenticação gerenciada;
- autorização por organização e projeto;
- políticas de acesso por linha no banco;
- documentos privados;
- URLs de curta duração;
- chaves somente no servidor;
- validação de MIME e tamanho;
- proteção contra upload abusivo;
- trilha de auditoria;
- exclusão e retenção configuráveis;
- links compartilháveis revogáveis;
- nenhuma informação de cliente em logs de aplicação além do necessário.

O repositório público deve conter apenas dados fictícios claramente identificados. Revise o seed existente e substitua qualquer nome, produto ou observação que possa representar informação pessoal por conteúdo demonstrativo neutro.

## Estados do projeto

Evolua `ProjectStatus` para um fluxo compatível com:

- `Coleta de arquivos`;
- `Processando documentos`;
- `Aguardando validação`;
- `Pronto para modelagem`;
- `Gerando 3D`;
- `Revisão do 3D`;
- `Publicado`;
- `Falha no processamento`.

As transições devem ser controladas por regras. Por exemplo, não permita `Pronto para modelagem` quando houver conflito estrutural aberto.

## Rotas ou ações mínimas

Implemente contratos equivalentes a:

- criar upload ou URL assinada;
- confirmar upload;
- listar arquivos do projeto;
- arquivar versão;
- iniciar processamento;
- consultar progresso;
- recuperar resultado;
- revisar fato extraído;
- resolver conflito;
- aceitar hipótese;
- aprovar conjunto estrutural;
- gerar nova versão da cena;
- recuperar a cena;
- criar, consultar e revogar compartilhamento.

Escolha Route Handlers ou Server Actions conforme o padrão do projeto. Não coloque tarefas longas dentro de uma requisição síncrona sem estratégia de retomada.

## Experiência do usuário

Preserve o visual atual e trate o fluxo como uma ferramenta profissional.

O dashboard administrativo deve mostrar:

- quantidade de arquivos;
- última análise;
- pendências críticas;
- percentual validado;
- status da cena;
- ação principal recomendada.

O cliente pode visualizar e comentar, mas decisões técnicas devem respeitar permissões configuráveis. Um administrador ou projetista deve conseguir corrigir tudo manualmente.

Use linguagem clara em português. Prepare internacionalização para português e espanhol, sem espalhar textos diretamente por toda a aplicação.

## Desempenho 3D

Para iPad e celulares:

- limite o pixel ratio;
- use instancing para objetos repetidos;
- descarte geometrias e materiais ao trocar de cena;
- carregue modelos sob demanda;
- use Draco e KTX2 quando fizer sentido;
- aplique LOD;
- evite sombras caras por padrão;
- ofereça qualidade automática, baixa, média e alta;
- mantenha interface acessível em orientação vertical e horizontal;
- teste perda e restauração do contexto WebGL.

A cena publicada deve possuir versão imutável. Edições posteriores criam uma nova versão.

## Observabilidade e custo

Registre por execução:

- modelo utilizado;
- páginas processadas;
- tokens de entrada e saída;
- duração;
- custo estimado;
- erros e tentativas;
- usuário solicitante;
- versão dos prompts e schemas.

Implemente limites configuráveis por projeto e organização. Não reanalise páginas que não mudaram. Use hash dos arquivos e cache de resultados.

## Estratégia de implementação

Trabalhe em fases e produza commits pequenos e descritivos.

### Fase 0 — auditoria

- mapear todos os arquivos e fluxos atuais;
- executar lint e build;
- documentar problemas encontrados;
- registrar decisões arquiteturais;
- não iniciar grande reescrita sem compreender o funcionamento atual.

### Fase 1 — domínio e persistência

- expandir tipos;
- criar schemas Zod;
- introduzir interfaces de repositório;
- preservar adaptador local para demonstração;
- adicionar banco, autenticação e storage para produção;
- migrar as telas existentes sem regressão.

### Fase 2 — arquivos

- implementar upload múltiplo;
- classificação, versões, preview e status;
- persistência privada e auditoria.

### Fase 3 — inteligência documental

- implementar provider de mock;
- implementar provider real no servidor;
- criar execução assíncrona;
- validar Structured Output;
- persistir citações, conflitos e custos.

### Fase 4 — validação

- criar a tela completa de revisão;
- impedir modelagem prematura;
- garantir histórico de alterações.

### Fase 5 — cena 3D

- criar schema da cena;
- gerador determinístico;
- adaptar o viewer genérico;
- adicionar controles desktop e touch;
- integrar objetos aos ambientes e itens.

### Fase 6 — compartilhamento e qualidade

- versões publicadas;
- links revogáveis;
- exportação ampliada;
- segurança, desempenho e acessibilidade;
- testes de ponta a ponta.

Ao final de cada fase:

1. rode lint;
2. rode verificação de tipos;
3. rode testes relevantes;
4. rode build de produção;
5. corrija falhas antes de continuar;
6. descreva o que foi alterado e riscos restantes.

## Testes essenciais

Cubra pelo menos:

- isolamento de projetos por usuário e organização;
- upload válido e inválido;
- arquivo substituído com histórico;
- resultado de IA válido e inválido;
- preservação de evidência;
- conflito que bloqueia modelagem;
- aprovação manual;
- conversão de unidades;
- coordenadas e escala;
- geração de parede, porta e janela;
- colisão;
- conectividade entre ambientes;
- teleporte;
- controle touch;
- carregamento de cena;
- exportação;
- revogação de link;
- ausência de chave da IA;
- retomada após falha.

Evite testes que apenas repetem detalhes internos. Teste regras de negócio e jornadas críticas.

## Critérios de aceitação do MVP

O MVP só está concluído quando:

- o fluxo atual de clientes, projetos, ambientes e itens continua funcionando;
- dados de produção não dependem de `localStorage`;
- um administrador consegue enviar vários PDFs e imagens;
- o sistema processa os arquivos com provider real ou mock;
- a extração mostra ambientes, medidas, móveis e acabamentos;
- cada informação possui fonte e página;
- conflitos e ausências ficam visíveis;
- o usuário consegue editar e aprovar;
- o sistema bloqueia o 3D enquanto houver conflito estrutural crítico;
- após a aprovação, uma cena é gerada em escala métrica;
- a cena possui maquete, vista superior, primeira pessoa e tour guiado;
- o tour funciona com mouse, teclado e toque;
- colisões impedem atravessar paredes;
- itens existentes aparecem ligados aos objetos ou ambientes correspondentes;
- o projeto pode ser compartilhado com segurança;
- o build de produção passa;
- existe documentação de instalação, variáveis, arquitetura e limitações.

## Variáveis de ambiente

Crie e documente um `.env.example`, sem valores reais, com nomes equivalentes a:

- `DATABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `OPENAI_API_KEY`;
- `OPENAI_DOCUMENT_MODEL`;
- `OPENAI_REVIEW_MODEL`;
- configuração do worker ou fila;
- configuração de armazenamento;
- URL pública da aplicação.

## Forma de trabalhar

- Comece lendo o repositório inteiro.
- Confirme o estado do lint e build antes de editar.
- Não substitua a aplicação por um projeto novo.
- Reutilize componentes e padrões atuais.
- Não faça alterações destrutivas nos dados.
- Crie migrações reversíveis.
- Prefira componentes pequenos e contratos tipados.
- Evite dependências desnecessárias.
- Não esconda problemas com mocks no caminho de produção.
- Quando uma credencial externa for necessária, conclua tudo que puder e documente exatamente a variável faltante.
- Não pare apenas em um plano: implemente a próxima fase autorizada e verificável.
- Não declare que algo está pronto sem executar as verificações correspondentes.

## Primeira entrega esperada

Na primeira entrega:

1. apresente uma auditoria curta da arquitetura atual;
2. proponha o modelo de dados final;
3. implemente a Fase 1 sem quebrar a demonstração;
4. implemente a Fase 2 com upload e telas funcionais;
5. implemente o provider mock e a tela inicial da Fase 3;
6. deixe os contratos do provider real preparados;
7. execute lint, typecheck e build;
8. entregue commits claros e um relatório com arquivos alterados, testes e próximos passos.

Depois continue com a validação e o motor 3D seguindo os critérios deste documento.
