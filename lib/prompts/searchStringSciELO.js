// lib/prompts/searchStringSciELO.js
export const SEARCH_STRING_SCIELO = `
2. SCIELO - INSTRUÇÕES COMPLETAS E DETALHADAS
ATENÇÃO CRÍTICA: SciELO NÃO usa MeSH nativamente! Usa DeCS (Descritores em Ciências da Saúde).

Características fundamentais da SciELO:
- Interface trilíngue: português, espanhol e inglês
- NÃO reconhece termos MeSH diretamente
- Usa DeCS, que é baseado no MeSH mas adaptado para América Latina
- EXIGE busca multilíngue para melhores resultados

Campos/Índices disponíveis:
- Todos os índices - busca em todos os campos
- Título - busca apenas nos títulos
- Autor - busca por nome de autores
- Resumo - busca no texto dos resumos
- Assunto/Palavras-chave - busca nas palavras-chave atribuídas
- Periódico - busca por nome da revista
- Ano de publicação - busca por ano específico
- Afiliação - busca por instituição

Sintaxe OBRIGATÓRIA:
- Operadores booleanos SEMPRE em MAIÚSCULAS: AND, OR, NOT
- Use aspas duplas para frases exatas: "diabetes mellitus tipo 2"
- Use parênteses para agrupar conceitos
- Use * para truncamento: diabet* (encontra diabetes, diabético, diabética)

REGRA DE OURO PARA SCIELO - BUSCA TRILÍNGUE COMPLETA:
Para CADA conceito, incluindo números, tempo e TODOS os elementos, você DEVE incluir:
1. Termo em português
2. Termo em espanhol
3. Termo em inglês
4. Sinônimos regionais quando existirem

ATENÇÃO ESPECIAL PARA TEMPO/NÚMEROS:
- "6 meses" → ("6 meses" OR "6 months" OR "seis meses" OR "six months" OR "6 meses" OR "seis meses")
- "12 semanas" → ("12 semanas" OR "12 weeks" OR "doze semanas" OR "twelve weeks" OR "12 semanas" OR "doce semanas")
- "1 ano" → ("1 ano" OR "1 year" OR "um ano" OR "one year" OR "1 año" OR "un año")

Processo de conversão MeSH → SciELO:
1. Extraia o conceito central do termo MeSH
2. Traduza para português e espanhol
3. Inclua variações e sinônimos em cada idioma
4. Considere terminologia regional latino-americana
5. SEMPRE traduza TODOS os elementos, incluindo números e períodos de tempo

Exemplos de tradução:
- "Diabetes Mellitus, Type 2" → ("diabetes mellitus" OR diabetes OR "diabetes tipo 2" OR "diabetes type 2" OR "diabetes mellitus tipo 2" OR "diabetes mellitus type 2")
- "Metformin" → (metformina OR metformin OR "cloridrato de metformina" OR "metformin hydrochloride" OR "clorhidrato de metformina")
- "Exercise" → (exercício OR ejercicio OR exercise OR "atividade física" OR "actividad física" OR "physical activity" OR "exercício físico" OR "ejercicio físico" OR "physical exercise")
- "Glycemic Control" → ("controle glicêmico" OR "control glucémico" OR "glycemic control" OR "controle da glicemia" OR "control de la glucemia" OR "blood glucose control" OR "hemoglobina glicada" OR "hemoglobina glucosilada" OR "glycated hemoglobin" OR HbA1c)

Estrutura padrão para SciELO:
((termo_portugues OR termo_espanhol OR termo_ingles OR sinonimo1 OR sinonimo2) 
AND 
(outro_termo_pt OR outro_termo_es OR outro_termo_en OR variacao1 OR variacao2)
AND
(terceiro_conceito_multiligue))

DICAS ESPECÍFICAS PARA SCIELO:
- Priorize termos mais gerais sobre muito específicos
- Inclua siglas comuns em saúde (DM2, HAS, etc.)
- Considere variações ortográficas entre países
- Use truncamento para capturar variações de gênero e número
- Lembre-se que muitos artigos têm resumo em inglês mas texto em português/espanhol
- SEMPRE traduza TODOS os elementos da busca para os três idiomas
`;