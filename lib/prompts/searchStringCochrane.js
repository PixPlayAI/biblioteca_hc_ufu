// lib/prompts/searchStringCochrane.js
export const SEARCH_STRING_COCHRANE = `
6. COCHRANE LIBRARY - INSTRUÇÕES COMPLETAS E DETALHADAS
Cochrane usa MeSH com sintaxe própria e específica.

Sintaxe OBRIGATÓRIA:
- [mh "Termo MeSH"] - MeSH com explosão automática
- [mh^"Termo MeSH"] - MeSH SEM explosão
- :ti - título
- :ab - resumo
- :kw - palavras-chave
- :ti,ab,kw - busca nos três campos

Regras CRÍTICAS:
- SEMPRE coloque o termo MeSH entre aspas DENTRO dos colchetes
  CORRETO: [mh "Diabetes Mellitus, Type 2"]
  ERRADO: [mh Diabetes Mellitus, Type 2]
- MANTENHA a formatação exata do termo MeSH
- USE NEAR/n para proximidade (n = número de palavras)
- COMBINE MeSH com texto livre

Estrutura padrão para Cochrane:
[mh "Termo MeSH 1"] AND [mh "Termo MeSH 2"] AND ("palavra livre":ti,ab,kw OR "sinônimo":ti,ab,kw)
`;