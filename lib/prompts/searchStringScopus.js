// lib/prompts/searchStringScopus.js
export const SEARCH_STRING_SCOPUS = `
8. SCOPUS - INSTRUÇÕES COMPLETAS E DETALHADAS
Scopus tem sintaxe própria com funções específicas.

Campos principais:
- TITLE() - busca no título
- ABS() - busca no resumo
- KEY() - busca nas palavras-chave
- TITLE-ABS-KEY() - busca nos três campos
- INDEXTERMS() - termos indexados (pode incluir MeSH)

Regras de sintaxe:
- SEMPRE coloque os termos entre aspas DENTRO dos parênteses
- USE W/n para proximidade (n = número de palavras)
- COMBINE campos com AND/OR

EXPANSÃO PARA SCOPUS:
Como Scopus tem cobertura internacional ampla:
- Inclua variações de grafia britânica/americana
- Adicione sinônimos científicos
- Inclua termos emergentes na área

Estrutura padrão para Scopus:
TITLE-ABS-KEY("termo 1" OR "sinônimo 1") AND TITLE-ABS-KEY("termo 2" OR "variação") AND INDEXTERMS("Termo MeSH")
`;