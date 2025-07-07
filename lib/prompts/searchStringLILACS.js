// lib/prompts/searchStringLILACS.js
export const SEARCH_STRING_LILACS = `
7. LILACS VIA BVS - INSTRUÇÕES COMPLETAS E DETALHADAS
LILACS usa DeCS (Descritores em Ciências da Saúde) - versão trilíngue do MeSH.

Campos disponíveis:
- mh: para descritores DeCS/MeSH
- ti: para título
- ab: para resumo
- tw: para palavras do texto

REGRA FUNDAMENTAL - BUSCA TRILÍNGUE:
SEMPRE inclua os termos em:
- Português
- Espanhol
- Inglês

Sintaxe obrigatória:
mh:"termo entre aspas quando tem espaços"

EXPANSÃO PARA LILACS:
Além dos termos DeCS, adicione:
- Variações regionais latino-americanas
- Termos coloquiais em português e espanhol
- Siglas comuns na América Latina

Traduções comuns:
- Diabetes Mellitus Type 2 → Diabetes Mellitus Tipo 2 → Diabetes Mellitus Tipo 2
- Metformin → Metformina → Metformina
- Exercise → Exercício → Ejercicio

Estrutura padrão para LILACS:
(mh:"Termo em Inglês" OR mh:"Termo em Português" OR mh:"Termo em Espanhol" OR tw:"variação" OR tw:"sinônimo") AND (mh:"Outro Termo Inglês" OR mh:"Outro Termo Português" OR mh:"Outro Termo Espanhol")
`;