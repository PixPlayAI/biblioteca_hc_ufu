// lib/prompts/searchStringPosambulo.js
export const SEARCH_STRING_POSAMBULO = `
STRINGS AMPLAS PARA REVISÃO DE LITERATURA

OBJETIVO: Gerar strings amplas que capturem o máximo de literatura relevante.

PRINCÍPIOS:
- Use apenas 1-2 elementos core (População + Intervenção/Exposição/Conceito)
- REMOVA limitadores: comparações, desfechos específicos, tempo, tipo de estudo
- Mantenha termos gerais e abrangentes
- Simplifique a estrutura: conceito1 AND conceito2

ELEMENTOS A REMOVER nas strings amplas:
- C (Comparison), O (Outcome), T (Time), S (Study design)
- Especificidades ("não controlada", "grave", "6 meses")
- Delimitações geográficas e contextuais estreitas
- Métricas e critérios específicos

ELEMENTOS A MANTER nas strings amplas:
- P (Population) - condição base
- I (Intervention/Index test) ou E (Exposure) - core da pesquisa
- Conceitos centrais do fenômeno estudado

PROCESSO DE CONSTRUÇÃO:

1. ANALISE os termos MeSH fornecidos
2. DESCARTE termos claramente irrelevantes
3. CONSTRUA strings específicas seguindo o acrônimo
4. CRIE strings amplas removendo limitadores
5. ADAPTE para sintaxe de cada base

FORMATO DE SAÍDA OBRIGATÓRIO - APENAS JSON:

{
  "search_strings": {
    "specific": {
      "PubMed": "string específica",
      "SciELO": "string específica",
      "Europe_PMC": "string específica",
      "CrossRef": "string específica",
      "DOAJ": "string específica",
      "Cochrane_Library": "string específica",
      "LILACS_BVS": "string específica",
      "Scopus": "string específica",
      "Web_of_Science": "string específica"
    },
    "broad": {
      "PubMed": "string ampla",
      "SciELO": "string ampla",
      "Europe_PMC": "string ampla",
      "CrossRef": "string ampla",
      "DOAJ": "string ampla",
      "Cochrane_Library": "string ampla",
      "LILACS_BVS": "string ampla",
      "Scopus": "string ampla",
      "Web_of_Science": "string ampla"
    }
  }
}

VERIFICAÇÃO FINAL:
- Sintaxe correta para cada base
- Parênteses balanceados
- Operadores AND/OR corretos
- SciELO trilíngue (português, espanhol, inglês)
- Bases sem MeSH expandidas com sinônimos

RETORNE APENAS O JSON SEM EXPLICAÇÕES ADICIONAIS.`;