// lib/prompts/searchStringEuropePMC.js
export const SEARCH_STRING_EUROPE_PMC = `
3. EUROPE PMC - INSTRUÇÕES COMPLETAS E DETALHADAS
Europe PMC tem sintaxe própria e diferente do PubMed. Regras OBRIGATÓRIAS:

Campos disponíveis:
- TITLE: para título
- ABSTRACT: para resumo
- AUTH: para autor
- KEYWORD: para palavras-chave

Sintaxe para MeSH no Europe PMC:
- Use: termo[MESH] (diferente do PubMed!)
- Exemplo: "diabetes mellitus type 2"[MESH]

Regras de construção:
- COMBINE TITLE e ABSTRACT para maior cobertura:
  (TITLE:"diabetes" OR ABSTRACT:"diabetes")
- MeSH só funciona para registros vindos do PubMed
- NÃO use aspas desnecessariamente, apenas para frases exatas
- CONECTE conceitos com AND entre parênteses

PARA EUROPE PMC (NÃO USA MESH NATIVAMENTE):
Como esta base não usa MeSH nativamente, você DEVE:
- Expandir com sinônimos e termos relacionados
- Incluir variações comuns de termos médicos
- Adicionar siglas e abreviações relevantes

Estrutura padrão para Europe PMC:
(TITLE:"termo principal" OR ABSTRACT:"termo principal" OR TITLE:"sinônimo" OR ABSTRACT:"sinônimo") AND (TITLE:"segundo termo" OR ABSTRACT:"segundo termo")
`;