// lib/prompts/searchStringWebOfScience.js
export const SEARCH_STRING_WEB_OF_SCIENCE = `
9. WEB OF SCIENCE - INSTRUÇÕES COMPLETAS E DETALHADAS
Web of Science usa field tags com sintaxe específica.

Campos disponíveis:
- TS= Topic (título, resumo, palavras-chave)
- TI= Título apenas
- AB= Resumo apenas
- MH= MeSH (APENAS para registros MEDLINE)

Regras críticas:
- OPERADORES booleanos SEMPRE em MAIÚSCULAS (AND, OR, NOT)
- USE aspas para frases
- USE parênteses para agrupar
- MH= funciona apenas parcialmente

EXPANSÃO PARA WEB OF SCIENCE:
- Adicione variações interdisciplinares
- Inclua termos de áreas correlatas
- Use truncamento estratégico com *

Estrutura padrão para Web of Science:
TS=("termo 1" OR "sinônimo 1" OR variação*) AND TS=("termo 2" OR "alternativa") AND TS=("termo 3" OR "variação")
`;