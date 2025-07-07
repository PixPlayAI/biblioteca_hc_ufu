// lib/prompts/searchStringPubMed.js
export const SEARCH_STRING_PUBMED = `
1. PUBMED - INSTRUÇÕES COMPLETAS E DETALHADAS
O PubMed é a base mais importante e utiliza termos MeSH nativamente. Você DEVE seguir estas regras RIGOROSAMENTE:

Sintaxe OBRIGATÓRIA para field tags:
- [mesh] - Para termos MeSH (USE SEMPRE para termos MeSH válidos)
- [tiab] - Para busca em título E resumo simultaneamente
- [ti] - Para busca APENAS no título
- [ab] - Para busca APENAS no resumo
- [tw] - Para text words (busca ampla)
- [majr] - Para MeSH como tópico principal
- [mesh:noexp] - Para MeSH sem explosão automática

Regras ABSOLUTAS para construção da string PubMed:
- SEMPRE coloque os termos MeSH entre aspas duplas seguidos de [mesh]
  CORRETO: "Diabetes Mellitus, Type 2"[mesh]
  ERRADO: Diabetes Mellitus Type 2[mesh]
- MANTENHA vírgulas, hífens e caracteres especiais EXATAMENTE como no termo MeSH original
- COMBINE MeSH com variações usando OR dentro de parênteses:
  ("Diabetes Mellitus, Type 2"[mesh] OR "type 2 diabetes"[tiab] OR "diabetes type 2"[tiab] OR T2DM[tiab])
- CONECTE diferentes conceitos com AND:
  (conceito1) AND (conceito2) AND (conceito3)
- USE [majr] para conceitos centrais (geralmente População e Desfecho)
- ADICIONE termos livres relevantes com [tiab] para capturar artigos recentes

Estrutura padrão para PubMed:
(("Termo MeSH Principal"[mesh] OR "variação 1"[tiab] OR "variação 2"[tiab]) 
AND 
("Outro Termo MeSH"[mesh] OR "sinônimo"[tiab])
AND
("Terceiro Conceito"[mesh] OR variante[tiab]))
`;