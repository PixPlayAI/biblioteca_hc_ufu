// lib/prompts/searchStringCrossRef.js
export const SEARCH_STRING_CROSSREF = `
4. CROSSREF - INSTRUÇÕES COMPLETAS E DETALHADAS
ATENÇÃO CRÍTICA: CrossRef NÃO suporta MeSH ou qualquer vocabulário controlado!

Regras FUNDAMENTAIS para CrossRef:
- NUNCA use termos MeSH diretamente
- EXTRAIA conceitos-chave das DESCRIÇÕES dos termos MeSH
- TRADUZA termos técnicos em palavras comuns
- USE apenas palavras separadas por espaços (AND implícito)
- EVITE pontuação e caracteres especiais

EXPANSÃO DE TERMOS PARA CROSSREF:
Como CrossRef não tem vocabulário controlado, você DEVE:
- Incluir sinônimos comuns
- Adicionar variações de grafia
- Incluir termos leigos quando apropriado
- Expandir siglas e abreviações

Processo de conversão MeSH → CrossRef:
- "Diabetes Mellitus, Type 2" → diabetes type 2 T2DM diabetic
- "Glycemic Control" → glycemic control glucose management HbA1c hemoglobin
- Leia a DESCRIÇÃO do MeSH e extraia palavras-chave relevantes

Estrutura para CrossRef:
palavra1 palavra2 palavra3 palavra4 sinonimo1 sinonimo2
`;