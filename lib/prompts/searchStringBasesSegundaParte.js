// lib/prompts/searchStringBasesSegundaParte.js
export const SEARCH_STRING_BASES_SEGUNDA_PARTE = `
3. EUROPE PMC - INSTRUÇÕES COMPLETAS E DETALHADAS
Europe PMC tem sintaxe própria e diferente do PubMed. Regras OBRIGATÓRIAS:

Campos disponíveis:
- TITLE: para título
- ABSTRACT: para resumo
- AUTH: para autor
- KEYWORD: para palavras-chave

Sintaxe para MeSH no Europe PMC:
- Use: termo[MESH] (diferente do PubMed!)
- Exemplo: "diabetes mellitus type 2"[MESH]

Regras de construção:
- COMBINE TITLE e ABSTRACT para maior cobertura:
  (TITLE:"diabetes" OR ABSTRACT:"diabetes")
- MeSH só funciona para registros vindos do PubMed
- NÃO use aspas desnecessariamente, apenas para frases exatas
- CONECTE conceitos com AND entre parênteses

PARA EUROPE PMC (NÃO USA MESH NATIVAMENTE):
Como esta base não usa MeSH nativamente, você DEVE:
- Expandir com sinônimos e termos relacionados
- Incluir variações comuns de termos médicos
- Adicionar siglas e abreviações relevantes

Estrutura padrão para Europe PMC:
(TITLE:"termo principal" OR ABSTRACT:"termo principal" OR TITLE:"sinônimo" OR ABSTRACT:"sinônimo") AND (TITLE:"segundo termo" OR ABSTRACT:"segundo termo")

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
[mh "Termo MeSH 1"] AND [mh "Termo MeSH 2"] AND ("palavra livre":ti,ab,kw OR "sinônimo":ti,ab,kw)`;