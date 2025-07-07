// lib/prompts/searchStringDOAJ.js
export const SEARCH_STRING_DOAJ = `
5. DOAJ - INSTRUÇÕES COMPLETAS E DETALHADAS
DOAJ não usa MeSH mas tem campos específicos de busca.

Campos disponíveis:
- bibjson.title: para título
- bibjson.abstract: para resumo
- bibjson.keywords: para palavras-chave
- bibjson.subject: para assunto/categoria

Regras de construção:
- EXTRAIA palavras-chave das descrições MeSH
- USE aspas para frases com espaços
- COMBINE múltiplos campos com OR
- CONECTE conceitos diferentes com AND

EXPANSÃO DE TERMOS PARA DOAJ:
Como DOAJ não usa vocabulário controlado, você DEVE:
- Adicionar sinônimos e termos relacionados
- Incluir variações de grafia internacional (ex: hemoglobin/haemoglobin)
- Adicionar termos em diferentes níveis de especificidade

Estrutura padrão para DOAJ:
(bibjson.title:"termo 1" OR bibjson.abstract:"termo 1" OR bibjson.keywords:"termo 1" OR bibjson.title:"sinônimo" OR bibjson.abstract:"sinônimo") AND (bibjson.title:"termo 2" OR bibjson.abstract:"termo 2")
`;