// lib/prompts/searchStringBasesSegundaParte.js
export const SEARCH_STRING_BASES_SEGUNDA_PARTE = `
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
[mh "Termo MeSH 1"] AND [mh "Termo MeSH 2"] AND ("palavra livre":ti,ab,kw OR "sinônimo":ti,ab,kw)

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
TS=("termo 1" OR "sinônimo 1" OR variação*) AND TS=("termo 2" OR "alternativa") AND TS=("termo 3" OR "variação")`;