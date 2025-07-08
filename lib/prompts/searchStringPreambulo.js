// lib/prompts/searchStringPreambulo.js
export const SEARCH_STRING_PREAMBULO = `GERAÇÃO DE STRINGS DE BUSCA PARA BASES CIENTÍFICAS

OBJETIVO: Criar strings otimizadas para 9 bases de dados baseando-se nos dados fornecidos.

INPUT ESPERADO:
1. Pergunta de pesquisa estruturada
2. Acrônimo já identificado (NÃO questione ou reclassifique)
3. Para cada elemento: descrição textual + termos MeSH + definições

ANÁLISE CRÍTICA DOS TERMOS MESH:
- Compare cada MeSH com a pergunta de pesquisa
- DESCARTE termos irrelevantes (ex: "Psychotherapy" em pesquisa sobre diabetes)
- Use APENAS MeSH fornecidos (exatamente como escritos)
- Adicione termos livres quando necessário

REGRAS DE SINTAXE:
- Agrupe conceitos relacionados: ((termo1 OR termo2) AND (termo3 OR termo4))
- Evite ambiguidade: NUNCA (A OR B AND C), sempre ((A OR B) AND C)

FRAMEWORKS E MAPEAMENTO DE ELEMENTOS:

PICO: P(População) I(Intervenção) C(Comparação) O(Desfecho)
PICOT: PICO + T(Tempo)
PICOS: PICO + S(Desenho do Estudo)
PEO: P(População) E(Exposição) O(Desfecho)
PECO: P(População) E(Exposição) C(Comparação) O(Desfecho)
PCC: P(População) C(Conceito) C2(Contexto)
SPIDER: S(Amostra) PI(Fenômeno de Interesse) D(Desenho) E(Avaliação) R(Tipo de Pesquisa)
PIRD: P(População) I(Teste Índice) R(Teste Referência) D(Diagnóstico)
CoCoPop: Co(Condição) Co2(Contexto) Pop(População)
SPICE: S(Contexto) P(Perspectiva) I(Intervenção) C(Comparação) E(Avaliação)
ECLIPSE: E(Expectativa) C(Clientes) L(Local) I(Impacto) P(Profissionais) SE(Serviço)
BeHEMoTh: Be(Comportamento) HE(Contexto Saúde) Mo(Exclusões) Th(Modelos/Teorias)

VARIAÇÕES ACEITAS:
- BeHEMoTh: Be/B, HE/H, Mo/M/E, Th/T
- SPIDER: PI é único elemento (não P+I)
- ECLIPSE: SE é único elemento (não S+E)
- CoCoPop: Dois "Co" diferentes
- PCC: Dois "C" diferentes

FOCO POR FRAMEWORK:
- PICO/PICOT/PICOS: Intervenções e tratamentos
- PEO/PECO: Exposições naturais/ocupacionais (NÃO intervenções)
- PCC: Revisões de escopo, termos amplos
- SPIDER: Pesquisa qualitativa, experiências
- PIRD: Acurácia diagnóstica
- CoCoPop: Prevalência e epidemiologia
- SPICE: Avaliação de serviços
- ECLIPSE: Políticas de saúde
- BeHEMoTh: Comportamento em saúde

INSTRUÇÕES ESPECÍFICAS POR BASE:
`;