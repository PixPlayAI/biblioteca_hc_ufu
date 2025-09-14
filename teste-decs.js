// teste-decs.js
import axios from 'axios';
import fs from 'fs';

// Configurações
const DECS_API_KEY = '12def41f483860c7fa3a684723250ce3';
const DECS_BASE_URL = 'https://api.bvsalud.org/decs/v2';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para log formatado
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const typeColors = {
    info: colors.cyan,
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    debug: colors.magenta
  };
  
  console.log(`${typeColors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// Função para imprimir separador
function separator(title) {
  console.log('\n' + colors.bright + colors.blue + '━'.repeat(60) + colors.reset);
  if (title) {
    console.log(colors.bright + colors.yellow + `🔍 ${title}` + colors.reset);
    console.log(colors.blue + '━'.repeat(60) + colors.reset);
  }
}

// Teste 1: Verificar endpoints básicos
async function testeEndpointBasico() {
  separator('TESTE 1: Endpoint Básico');
  
  const endpoints = [
    '/search',
    '/descriptor',
    '/tree',
    '/'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${DECS_BASE_URL}${endpoint}`;
    log(`Testando endpoint: ${url}`, 'info');
    
    try {
      const response = await axios.get(url, {
        headers: {
          'apikey': DECS_API_KEY,
          'Accept': 'application/json'
        },
        params: endpoint === '/search' ? { q: 'diabetes', lang: 'pt', count: 1 } : {},
        timeout: 10000,
        validateStatus: function (status) {
          return status < 600; // Aceita qualquer status para debug
        }
      });
      
      log(`✅ Status: ${response.status}`, response.status === 200 ? 'success' : 'warning');
      log(`Headers recebidos: ${JSON.stringify(response.headers['content-type'])}`, 'debug');
      
      if (response.data) {
        log(`Tipo de resposta: ${typeof response.data}`, 'debug');
        if (typeof response.data === 'object') {
          log(`Estrutura da resposta: ${JSON.stringify(Object.keys(response.data))}`, 'debug');
          
          // Se tem dados, mostra um exemplo
          if (response.data.docs && response.data.docs.length > 0) {
            log(`Exemplo de documento:`, 'debug');
            console.log(JSON.stringify(response.data.docs[0], null, 2));
          }
        }
      }
      
    } catch (error) {
      log(`❌ Erro no endpoint ${endpoint}: ${error.message}`, 'error');
      if (error.response) {
        log(`Status de erro: ${error.response.status}`, 'error');
        log(`Mensagem de erro: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  }
}

// Teste 2: Busca simples
async function testeBuscaSimples() {
  separator('TESTE 2: Busca Simples');
  
  const termos = ['diabetes', 'hypertension', 'covid'];
  const linguas = ['pt', 'en', 'es'];
  
  for (const termo of termos) {
    for (const lingua of linguas) {
      log(`Buscando "${termo}" em ${lingua}`, 'info');
      
      try {
        const response = await axios.get(`${DECS_BASE_URL}/search`, {
          params: {
            q: termo,
            lang: lingua,
            count: 2
          },
          headers: {
            'apikey': DECS_API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        if (response.data) {
          log(`✅ Resposta recebida para "${termo}" (${lingua})`, 'success');
          
          // Analisar estrutura
          if (response.data.total !== undefined) {
            log(`Total de resultados: ${response.data.total}`, 'info');
          }
          
          if (response.data.docs && Array.isArray(response.data.docs)) {
            log(`Documentos retornados: ${response.data.docs.length}`, 'info');
            
            // Mostrar primeiro resultado
            if (response.data.docs.length > 0) {
              const doc = response.data.docs[0];
              console.log(colors.cyan + 'Primeiro resultado:' + colors.reset);
              console.log(`  ID: ${doc.id || doc.decs_code || 'N/A'}`);
              console.log(`  Descritor PT: ${doc.descriptor_pt || doc.preferred_term_pt || 'N/A'}`);
              console.log(`  Descritor EN: ${doc.descriptor_en || doc.preferred_term_en || 'N/A'}`);
              console.log(`  Descritor ES: ${doc.descriptor_es || doc.preferred_term_es || 'N/A'}`);
              
              // Verificar campos disponíveis
              const campos = Object.keys(doc);
              console.log(`  Campos disponíveis: ${campos.slice(0, 10).join(', ')}${campos.length > 10 ? '...' : ''}`);
            }
          }
        }
        
        // Aguardar um pouco entre requisições
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        log(`❌ Erro ao buscar "${termo}" (${lingua}): ${error.message}`, 'error');
      }
    }
  }
}

// Teste 3: Headers diferentes
async function testeHeaders() {
  separator('TESTE 3: Diferentes Configurações de Headers');
  
  const configuracoes = [
    {
      nome: 'Header no cabeçalho (apikey)',
      headers: {
        'apikey': DECS_API_KEY,
        'Accept': 'application/json'
      },
      params: { q: 'fever', lang: 'en', count: 1 }
    },
    {
      nome: 'Header no cabeçalho (Authorization Bearer)',
      headers: {
        'Authorization': `Bearer ${DECS_API_KEY}`,
        'Accept': 'application/json'
      },
      params: { q: 'fever', lang: 'en', count: 1 }
    },
    {
      nome: 'API Key como parâmetro',
      headers: {
        'Accept': 'application/json'
      },
      params: { q: 'fever', lang: 'en', count: 1, apikey: DECS_API_KEY }
    },
    {
      nome: 'API Key como api_key',
      headers: {
        'Accept': 'application/json'
      },
      params: { q: 'fever', lang: 'en', count: 1, api_key: DECS_API_KEY }
    }
  ];
  
  for (const config of configuracoes) {
    log(`Testando: ${config.nome}`, 'info');
    
    try {
      const response = await axios.get(`${DECS_BASE_URL}/search`, {
        headers: config.headers,
        params: config.params,
        timeout: 10000,
        validateStatus: function (status) {
          return status < 600;
        }
      });
      
      if (response.status === 200) {
        log(`✅ SUCESSO com ${config.nome}`, 'success');
        if (response.data && response.data.docs) {
          log(`Documentos retornados: ${response.data.docs.length}`, 'info');
        }
      } else {
        log(`⚠️ Status ${response.status} com ${config.nome}`, 'warning');
      }
      
    } catch (error) {
      log(`❌ Erro com ${config.nome}: ${error.message}`, 'error');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Teste 4: Endpoints alternativos
async function testeEndpointsAlternativos() {
  separator('TESTE 4: URLs e Endpoints Alternativos');
  
  const urls = [
    'https://api.bvsalud.org/decs/v2',
    'https://decs.bvsalud.org/api/v2',
    'https://decs.bvsalud.org/cgi-bin/wxis1660.exe/decsserver/',
    'https://api.bvsalud.org/decs',
    'https://decs.bvsalud.org/api',
    'http://api.bvsalud.org/decs/v2'
  ];
  
  for (const baseUrl of urls) {
    log(`Testando URL base: ${baseUrl}`, 'info');
    
    try {
      const url = baseUrl.includes('wxis') ? baseUrl : `${baseUrl}/search`;
      const response = await axios.get(url, {
        headers: {
          'apikey': DECS_API_KEY,
          'Accept': 'application/json'
        },
        params: baseUrl.includes('wxis') ? {} : { q: 'pain', lang: 'en', count: 1 },
        timeout: 10000,
        validateStatus: function (status) {
          return status < 600;
        }
      });
      
      log(`Status: ${response.status}`, response.status === 200 ? 'success' : 'warning');
      
      if (response.status === 200) {
        log(`✅ URL funcional: ${baseUrl}`, 'success');
        if (response.data) {
          const dataType = typeof response.data;
          log(`Tipo de resposta: ${dataType}`, 'debug');
          
          if (dataType === 'string' && response.data.includes('<?xml')) {
            log(`Resposta em XML detectada`, 'info');
          } else if (dataType === 'object') {
            log(`Resposta em JSON detectada`, 'info');
          }
        }
      }
      
    } catch (error) {
      log(`❌ Erro na URL ${baseUrl}: ${error.message}`, 'error');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Teste 5: Análise detalhada de uma resposta bem-sucedida
async function testeAnaliseDetalhada() {
  separator('TESTE 5: Análise Detalhada de Resposta');
  
  try {
    const response = await axios.get(`${DECS_BASE_URL}/search`, {
      params: {
        q: 'coronavirus',
        lang: 'pt',
        count: 3
      },
      headers: {
        'apikey': DECS_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    if (response.status === 200 && response.data) {
      log('✅ Resposta recebida com sucesso', 'success');
      
      // Análise completa da estrutura
      console.log('\n' + colors.bright + 'ESTRUTURA COMPLETA DA RESPOSTA:' + colors.reset);
      console.log('================================');
      
      // Nível raiz
      const rootKeys = Object.keys(response.data);
      console.log('Chaves na raiz:', rootKeys);
      
      // Se tem docs
      if (response.data.docs && Array.isArray(response.data.docs)) {
        console.log(`\nTotal de documentos: ${response.data.docs.length}`);
        
        // Analisar cada documento
        response.data.docs.forEach((doc, index) => {
          console.log(`\n${colors.yellow}Documento ${index + 1}:${colors.reset}`);
          console.log('-'.repeat(40));
          
          // Mostrar todos os campos
          const fields = Object.keys(doc);
          console.log(`Total de campos: ${fields.length}`);
          
          // Campos principais
          const mainFields = [
            'id', 'decs_code', 'descriptor_pt', 'descriptor_en', 'descriptor_es',
            'preferred_term_pt', 'preferred_term_en', 'preferred_term_es',
            'definition_pt', 'definition_en', 'definition_es',
            'scope_note_pt', 'scope_note_en', 'scope_note_es'
          ];
          
          mainFields.forEach(field => {
            if (doc[field]) {
              const value = typeof doc[field] === 'string' 
                ? doc[field].substring(0, 100) + (doc[field].length > 100 ? '...' : '')
                : JSON.stringify(doc[field]);
              console.log(`  ${field}: ${value}`);
            }
          });
          
          // Listar outros campos disponíveis
          const otherFields = fields.filter(f => !mainFields.includes(f));
          if (otherFields.length > 0) {
            console.log(`  Outros campos: ${otherFields.join(', ')}`);
          }
        });
      }
      
      // Salvar exemplo completo
      console.log('\n' + colors.bright + 'SALVANDO EXEMPLO COMPLETO EM: decs-response-example.json' + colors.reset);
      fs.writeFileSync(
        'decs-response-example.json',
        JSON.stringify(response.data, null, 2)
      );
      
    }
  } catch (error) {
    log(`❌ Erro na análise detalhada: ${error.message}`, 'error');
  }
}

// Função principal
async function main() {
  console.log('\n' + colors.bright + colors.cyan + '🏥 TESTE COMPLETO DA API DeCS' + colors.reset);
  console.log(colors.cyan + '================================' + colors.reset);
  console.log(`API Key: ${DECS_API_KEY}`);
  console.log(`URL Base: ${DECS_BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    await testeEndpointBasico();
    await testeBuscaSimples();
    await testeHeaders();
    await testeEndpointsAlternativos();
    await testeAnaliseDetalhada();
    
    separator('TESTE CONCLUÍDO');
    log('✅ Todos os testes foram executados', 'success');
    log('📄 Verifique o arquivo decs-response-example.json para um exemplo completo', 'info');
    
  } catch (error) {
    log(`❌ Erro geral nos testes: ${error.message}`, 'error');
    console.error(error);
  }
}

// Executar
main();