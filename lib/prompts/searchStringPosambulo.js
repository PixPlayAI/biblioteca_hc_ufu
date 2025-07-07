// lib/prompts/searchStringPosambulo.js
export const SEARCH_STRING_POSAMBULO = `
NOVA SEÇÃO: GERAÇÃO DE STRINGS AMPLAS PARA REVISÃO DE LITERATURA

OBJETIVO DAS STRINGS AMPLAS
Além das strings específicas, você DEVE gerar strings amplas para revisão de literatura. Estas strings têm como objetivo:
- Capturar o máximo de literatura relevante sobre o tema
- Permitir uma visão abrangente do estado da arte
- Identificar estudos que poderiam ser perdidos com buscas muito específicas
- Facilitar revisões narrativas e de escopo

PRINCÍPIOS PARA CONSTRUÇÃO DE STRINGS AMPLAS
Baseando-se nas orientações validadas por especialistas, você DEVE:

ELEMENTOS A REMOVER/DESCONSIDERAR NAS STRINGS AMPLAS:
1. C (Comparison): Limita muito os resultados. Ao remover, você encontra estudos com qualquer comparador
2. O (Outcome): É o maior limitador. Remover permite encontrar estudos que avaliam múltiplos desfechos
3. Especificidades da População: Termos como "não controlada", "grave", "estágio III" restringem demais
4. T (Time): É altamente limitador. "6 meses", "1 ano" reduzem drasticamente os resultados
5. S (Study design): Limitar a "RCTs" ou "coorte" exclui outros designs valiosos
6. Context específico demais: "UTI neonatal do hospital X" vs apenas "UTI"
7. Delimitações geográficas estreitas: "São Paulo" vs "Brasil" vs sem limitação
8. D (Design) em SPIDER: "entrevistas fenomenológicas" limita - prefira buscar qualquer método qualitativo
9. R (Research type): Muito específico pode excluir estudos relevantes
10. E (Evaluation) muito específica: Limita achados
11. R (Reference test) em PIRD: Pode haver múltiplos padrões-ouro
12. Métricas específicas: "sensibilidade >90%" limita demais
13. Context temporal muito específico: "janeiro 2023" vs "2023" vs "pandemia"
14. P (Perspective) específica em SPICE: "enfermeiros da UTI" vs "profissionais de saúde"
15. E (Expectation) muito específica em ECLIPSE: Limita inovações
16. L (Location) restrita: Ampliar geograficamente
17. I (Impact) específico: Pode haver impactos não previstos
18. E (Exclusions) em BeHEMoTh: Por definição, já limita
19. M (Models) específicos: "Apenas Modelo Transteórico" exclui outras teorias
20. Comportamentos muito detalhados: "fumar 20 cigarros/dia" vs "tabagismo"

ELEMENTOS A MANTER NAS STRINGS AMPLAS:
1. P (Population): Mantenha a condição base (ex: "diabetes tipo 2" sem o "não controlada")
2. I (Intervention): É o core da pesquisa - mantenha o tratamento principal
3. E (Exposure): É essencial - o fator de exposição é o core do estudo
4. C (Concept) em PCC: É o fenômeno central - mantenha
5. PI (Phenomenon) em SPIDER: É o core - as experiências/percepções que você quer estudar
6. I (Index test) em PIRD: O teste que você quer avaliar
7. D (Diagnosis): A condição diagnosticada
8. Co (Condition) em CoCoPop: É fundamental
9. Pop (Population): Grupo base
10. S (Setting) em SPICE: Tipo de serviço
11. I (Intervention): Processo/mudança avaliada
12. C (Client group) em ECLIPSE: População-alvo
13. S (Service): Tipo de serviço base
14. B (Behavior) em BeHEMoTh: Comportamento central
15. H (Health context): Contexto geral de saúde

ESTRATÉGIA DE CONSTRUÇÃO DAS STRINGS AMPLAS:
1. Use apenas 1-2 elementos core (geralmente População + Intervenção/Exposição/Conceito)
2. Remova TODOS os limitadores listados acima
3. Use termos mais gerais e abrangentes
4. Evite especificações desnecessárias
5. Mantenha a estrutura lógica simples: conceito1 AND conceito2
6. Para MeSH no PubMed: use sem [majr], permitindo explosão completa
7. Não inclua filtros de tipo de estudo, tempo, ou métricas específicas

EXEMPLOS DE TRANSFORMAÇÃO PARA STRINGS AMPLAS:
Pergunta original: "Pacientes adultos com diabetes tipo 2 não controlada + metformina vs dieta + controle glicêmico em 6 meses"
String específica: ((diabetes não controlada) AND (metformina) AND (dieta) AND (controle glicêmico) AND (6 meses))
String ampla: ((diabetes tipo 2) AND (metformina))

Pergunta original: "Enfermeiros de UTI neonatal + burnout vs sem intervenção + qualidade de vida após 1 ano"
String específica: ((enfermeiros UTI neonatal) AND (burnout) AND (sem intervenção) AND (qualidade de vida) AND (1 ano))
String ampla: ((enfermeiros) AND (burnout))

ADAPTAÇÃO DAS STRINGS AMPLAS PARA CADA BASE:
- Mantenha as regras de sintaxe específicas de cada base
- Use a mesma lógica de tradução e expansão
- Mas sempre com foco na amplitude, não na especificidade
- Para bases sem vocabulário controlado: use termos ainda mais gerais

PROCESSO DE CONSTRUÇÃO DAS STRINGS - PASSO A PASSO DETALHADO

PASSO 1: Análise inicial
- LEIA a pergunta de pesquisa COMPLETAMENTE
- ACEITE o acrônimo fornecido SEM QUESTIONAMENTO
- COMPREENDA cada elemento do acrônimo e seu conteúdo

PASSO 2: Análise crítica dos termos MeSH
Para CADA termo MeSH fornecido:
- LEIA o termo
- LEIA sua descrição COMPLETA
- COMPARE com a pergunta de pesquisa
- DECIDA: é relevante ou deve ser descartado?
- DESCARTE sem hesitação termos como:
  - Phenformin (quando a pesquisa é sobre Metformina)
  - Psychotherapy, Multiple (em pesquisa sobre diabetes)
  - Termos claramente não relacionados

PASSO 3: Seleção dos termos principais
- IDENTIFIQUE os termos MeSH REALMENTE relevantes
- DETERMINE quais são centrais (para usar com [majr] no PubMed)
- PENSE em sinônimos e variações

PASSO 4: Construção base conforme o acrônimo fornecido
Para PICO/PICOT/PICOS:
(População) AND (Intervenção) AND (Comparação - se relevante) AND (Desfecho)

Para PEO/PECO:
(População) AND (Exposição - use termos de exposição, NÃO de tratamento) AND (Desfecho)

Para PCC:
(População) AND (Conceito - termos amplos) AND (Contexto)

Para SPIDER:
(Amostra) AND (Fenômeno) AND (termos qualitativos)

Para outros acrônimos:
Adapte conforme os elementos específicos

PASSO 5: Adaptação para cada base
- PubMed: Use sintaxe MeSH completa
- SciELO: Converta para busca trilíngue com expansão COMPLETA (incluindo números e tempo)
- Europe PMC: Adapte para campos TITLE/ABSTRACT com expansão de sinônimos
- CrossRef: Converta em palavras simples com sinônimos
- DOAJ: Use campos bibjson com termos expandidos
- Cochrane: Use sintaxe [mh ""]
- LILACS: Traduza para 3 idiomas com variações regionais
- Scopus: Use funções TITLE-ABS-KEY() com variações
- Web of Science: Use TS= com MAIÚSCULAS e expansões

PASSO 6: Criação das strings amplas
Para CADA base, crie uma segunda versão:
- IDENTIFIQUE os elementos core (geralmente 1-2)
- REMOVA todos os limitadores e especificidades
- SIMPLIFIQUE a estrutura lógica
- MANTENHA apenas o essencial para capturar o tema
- ADAPTE à sintaxe específica da base

ADIÇÃO DE TERMOS LIVRES - QUANDO E COMO
Você PODE e DEVE adicionar termos livres quando:
- O conceito é muito novo (não coberto por MeSH)
- Existem sinônimos comuns não incluídos
- Há siglas amplamente usadas
- Variações de grafia são comuns

Para bases SEM MeSH (CrossRef, DOAJ, partes de Europe PMC, SciELO):
- SEMPRE expanda com sinônimos relevantes
- Adicione variações de grafia
- Inclua termos leigos quando apropriado
- Use artifícios da base quando disponíveis (truncamento, wildcards)

Exemplos de adições úteis:
- Para "Diabetes Mellitus, Type 2": adicione T2DM, type 2 diabetes, diabetes type 2
- Para metformina: adicione glucophage (nome comercial)
- Para COVID-19: adicione SARS-CoV-2, coronavirus disease 2019

FORMATO DE SAÍDA OBRIGATÓRIO
Você DEVE retornar EXCLUSIVAMENTE um JSON no formato válido abaixo, sem NENHUM texto adicional antes ou depois:

{
  "search_strings": {
    "specific": {
      "PubMed": "string específica completa do PubMed aqui",
      "SciELO": "string específica completa do SciELO aqui",
      "Europe_PMC": "string específica completa do Europe PMC aqui",
      "CrossRef": "string específica completa do CrossRef aqui",
      "DOAJ": "string específica completa do DOAJ aqui",
      "Cochrane_Library": "string específica completa do Cochrane aqui",
      "LILACS_BVS": "string específica completa do LILACS aqui",
      "Scopus": "string específica completa do Scopus aqui",
      "Web_of_Science": "string específica completa do Web of Science aqui"
    },
    "broad": {
      "PubMed": "string ampla para revisão de literatura do PubMed aqui",
      "SciELO": "string ampla para revisão de literatura do SciELO aqui",
      "Europe_PMC": "string ampla para revisão de literatura do Europe PMC aqui",
      "CrossRef": "string ampla para revisão de literatura do CrossRef aqui",
      "DOAJ": "string ampla para revisão de literatura do DOAJ aqui",
      "Cochrane_Library": "string ampla para revisão de literatura do Cochrane aqui",
      "LILACS_BVS": "string ampla para revisão de literatura do LILACS aqui",
      "Scopus": "string ampla para revisão de literatura do Scopus aqui",
      "Web_of_Science": "string ampla para revisão de literatura do Web of Science aqui"
    }
  }
}

VERIFICAÇÃO FINAL OBRIGATÓRIA
Antes de gerar o JSON, verifique CADA string:
- Sintaxe correta? Cada base tem sua sintaxe específica
- MeSH escritos corretamente? Vírgulas, hífens, maiúsculas
- Parênteses balanceados? Abriu 3, fechou 3
- Aspas corretas? Não misture aspas simples com duplas
- Operadores corretos? AND/OR na posição certa
- Termos irrelevantes removidos? Não inclua MeSH sem relação
- Adaptação apropriada? Estrutura condizente com elementos fornecidos
- SciELO trilíngue COMPLETO? Incluiu português, espanhol e inglês para TODOS os conceitos (incluindo números e tempo)
- Bases sem MeSH expandidas? Incluiu sinônimos e variações
- Sem ambiguidade lógica? Parênteses agrupando conceitos corretamente
- Strings amplas realmente simplificadas? Removeu limitadores e manteve apenas o essencial
- Duas versões para cada base? Uma específica e uma ampla

LEMBRETES FINAIS CRÍTICOS
- O acrônimo JÁ FOI IDENTIFICADO - aceite sem questionar
- ANALISE CRITICAMENTE cada termo MeSH - muitos podem ser irrelevantes
- NUNCA adicione MeSH novos - trabalhe apenas com os fornecidos
- SEMPRE mantenha MeSH exatos - não modifique NADA
- PODE adicionar termos livres - quando melhorar a busca
- FOQUE na relevância - qualidade sobre quantidade
- RETORNE APENAS o JSON - sem explicações adicionais
- SCIELO SEMPRE TRILÍNGUE COMPLETO - português, espanhol e inglês para TUDO
- BASES SEM MESH SEMPRE EXPANDIDAS - inclua sinônimos e variações
- EVITE AMBIGUIDADE LÓGICA - use parênteses corretamente
- GERE DUAS STRINGS POR BASE - uma específica e uma ampla para revisão
- STRINGS AMPLAS DEVEM SER SIMPLIFICADAS - removendo limitadores conforme instruções

Agora, analise cuidadosamente o input fornecido e gere as strings de busca otimizadas para cada base de dados, seguindo RIGOROSAMENTE todas as instruções acima.`;