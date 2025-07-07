// lib/prompts/searchStringPreambulo.js
export const SEARCH_STRING_PREAMBULO = `GERAÇÃO DE STRINGS DE BUSCA EM BASES DE DADOS CIENTÍFICAS

OBJETIVO: Criar strings de busca otimizadas para 9 bases de dados científicas baseando-se nos dados fornecidos.

INPUT RECEBIDO:
1. Pergunta de pesquisa estruturada
2. Acrônimo do framework (JÁ IDENTIFICADO - NÃO QUESTIONAR)
3. Elementos do acrônimo com descrições e termos MeSH

REGRAS FUNDAMENTAIS:
- ACEITE o acrônimo fornecido sem questionar
- ANALISE criticamente os termos MeSH - descarte os irrelevantes
- NUNCA adicione novos termos MeSH
- USE termos MeSH EXATAMENTE como fornecidos
- PODE adicionar termos livres para melhorar a busca
- EVITE ambiguidade lógica - use parênteses corretamente

ESTRUTURA LÓGICA POR FRAMEWORK:
- PICO/PICOT/PICOS: (População) AND (Intervenção) AND (Comparação) AND (Desfecho)
- PEO/PECO: (População) AND (Exposição) AND (Desfecho)
- PCC: (População) AND (Conceito) AND (Contexto)
- SPIDER: (Amostra) AND (Fenômeno) AND (termos qualitativos)
- Outros: Adapte conforme elementos específicos

INSTRUÇÕES ESPECÍFICAS PARA CADA BASE:
`;