// lib/prompts/searchStringPosambulo.js
export const SEARCH_STRING_POSAMBULO = `
STRINGS AMPLAS (Revisão de Literatura)
Objetivo: Capturar máximo de literatura relevante removendo limitadores.

REMOVER nas strings amplas:
- C(Comparação), O(Desfecho), T(Tempo), S(Desenho)
- Especificidades: "não controlada", "grave", "6 meses"
- Contextos restritos: "UTI neonatal" → "UTI"
- Localização específica, métricas, exclusões

MANTER nas strings amplas:
- População base (sem especificidades)
- Intervenção/Exposição/Conceito principal
- Máximo 2 elementos core
- Estrutura: conceito1 AND conceito2

PROCESSO DE CONSTRUÇÃO:

1. ANÁLISE: Aceite o acrônimo fornecido
2. SELEÇÃO MESH: Descarte irrelevantes, mantenha exatos
3. ESTRUTURA BASE:
   - PICO: (População) AND (Intervenção) AND (Comparação) AND (Desfecho)
   - PEO: (População) AND (Exposição) AND (Desfecho)
   - PCC: (População) AND (Conceito) AND (Contexto)
   - SPIDER: (Amostra) AND (Fenômeno) AND (método qualitativo)
   - Adapte outros frameworks conforme elementos

4. ADAPTAÇÃO POR BASE:
   • PubMed: MeSH com [mesh], [majr], [tiab]
   • SciELO: Trilíngue COMPLETO (PT/ES/EN)
   • Europe PMC: TITLE/ABSTRACT com sinônimos
   • CrossRef: Palavras simples
   • DOAJ: Campos bibjson
   • Cochrane: Sintaxe [mh ""]
   • LILACS: Trilíngue com variações regionais
   • Scopus: TITLE-ABS-KEY()
   • Web of Science: TS= com MAIÚSCULAS

5. TERMOS LIVRES: Adicione para conceitos novos, siglas, sinônimos

FORMATO DE SAÍDA (JSON EXATO):
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

CHECKLIST FINAL:
✓ Sintaxe correta por base
✓ MeSH exatos (vírgulas, hífens)
✓ Parênteses balanceados
✓ Operadores AND/OR corretos
✓ SciELO sempre trilíngue
✓ Strings amplas simplificadas
✓ Duas versões por base

RETORNE APENAS O JSON, sem explicações.`;