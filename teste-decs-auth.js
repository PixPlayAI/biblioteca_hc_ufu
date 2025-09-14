// teste-decs-auth.js
import axios from 'axios';

const DECS_API_KEY = '12def41f483860c7fa3a684723250ce3';

console.log('\n🔐 TESTE DE AUTENTICAÇÃO - API DeCS');
console.log('=====================================');
console.log('API Key:', DECS_API_KEY);
console.log('');

// Função para testar diferentes formatos de autenticação
async function testarAutenticacao() {
  const configs = [
    {
      nome: '1. X-Api-Key no header',
      config: {
        headers: { 'X-Api-Key': DECS_API_KEY }
      }
    },
    {
      nome: '2. x-api-key no header (minúsculo)',
      config: {
        headers: { 'x-api-key': DECS_API_KEY }
      }
    },
    {
      nome: '3. API-Key no header',
      config: {
        headers: { 'API-Key': DECS_API_KEY }
      }
    },
    {
      nome: '4. apikey no header (como estava)',
      config: {
        headers: { 'apikey': DECS_API_KEY }
      }
    },
    {
      nome: '5. Apikey no header (capitalizado)',
      config: {
        headers: { 'Apikey': DECS_API_KEY }
      }
    },
    {
      nome: '6. Authorization com Bearer',
      config: {
        headers: { 'Authorization': `Bearer ${DECS_API_KEY}` }
      }
    },
    {
      nome: '7. Authorization com Token',
      config: {
        headers: { 'Authorization': `Token ${DECS_API_KEY}` }
      }
    },
    {
      nome: '8. Authorization com ApiKey',
      config: {
        headers: { 'Authorization': `ApiKey ${DECS_API_KEY}` }
      }
    },
    {
      nome: '9. Authorization direto',
      config: {
        headers: { 'Authorization': DECS_API_KEY }
      }
    },
    {
      nome: '10. Token no header',
      config: {
        headers: { 'Token': DECS_API_KEY }
      }
    },
    {
      nome: '11. access_token como parâmetro',
      config: {
        params: { access_token: DECS_API_KEY, q: 'test', lang: 'en' }
      }
    },
    {
      nome: '12. token como parâmetro',
      config: {
        params: { token: DECS_API_KEY, q: 'test', lang: 'en' }
      }
    },
    {
      nome: '13. key como parâmetro',
      config: {
        params: { key: DECS_API_KEY, q: 'test', lang: 'en' }
      }
    },
    {
      nome: '14. apikey como parâmetro',
      config: {
        params: { apikey: DECS_API_KEY, q: 'test', lang: 'en' }
      }
    },
    {
      nome: '15. api_key como parâmetro',
      config: {
        params: { api_key: DECS_API_KEY, q: 'test', lang: 'en' }
      }
    }
  ];

  for (const teste of configs) {
    console.log(`\nTestando: ${teste.nome}`);
    console.log('-'.repeat(40));
    
    try {
      // Configuração base
      const requestConfig = {
        ...teste.config,
        timeout: 5000,
        validateStatus: () => true // Aceita qualquer status
      };
      
      // Se não tem params, adiciona params básicos
      if (!requestConfig.params) {
        requestConfig.params = { q: 'test', lang: 'en' };
      }
      
      // Adiciona Accept header sempre
      if (!requestConfig.headers) {
        requestConfig.headers = {};
      }
      requestConfig.headers['Accept'] = 'application/json';
      
      const response = await axios.get(
        'https://api.bvsalud.org/decs/v2/search',
        requestConfig
      );
      
      if (response.status === 200) {
        console.log(`✅ SUCESSO! Status: ${response.status}`);
        console.log('📌 FORMATO CORRETO ENCONTRADO!');
        console.log('Resposta:', JSON.stringify(response.data).substring(0, 200));
        
        // Salvar configuração que funcionou
        console.log('\n🎯 CONFIGURAÇÃO QUE FUNCIONOU:');
        console.log(JSON.stringify(teste.config, null, 2));
        
        return teste.config; // Retorna a config que funcionou
      } else {
        console.log(`❌ Falhou - Status: ${response.status}`);
        if (response.data && response.data.message) {
          console.log(`   Mensagem: ${response.data.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Pequeno delay entre tentativas
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return null;
}

// Testar endpoint de documentação/info
async function testarEndpointInfo() {
  console.log('\n\n📚 TESTANDO ENDPOINTS DE INFORMAÇÃO');
  console.log('====================================');
  
  const endpoints = [
    'https://api.bvsalud.org/decs',
    'https://api.bvsalud.org/decs/v2',
    'https://api.bvsalud.org/decs/v2/info',
    'https://api.bvsalud.org/decs/v2/docs',
    'https://api.bvsalud.org/decs/v2/swagger',
    'https://api.bvsalud.org/decs/v2/openapi',
    'https://api.bvsalud.org/decs/v2/help'
  ];
  
  for (const url of endpoints) {
    console.log(`\nTestando: ${url}`);
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      console.log(`Status: ${response.status}`);
      if (response.data) {
        const dataStr = JSON.stringify(response.data);
        console.log(`Resposta: ${dataStr.substring(0, 150)}...`);
      }
    } catch (error) {
      console.log(`Erro: ${error.message}`);
    }
  }
}

// Executar testes
async function main() {
  const configFuncional = await testarAutenticacao();
  
  if (!configFuncional) {
    console.log('\n\n⚠️  NENHUM FORMATO DE AUTENTICAÇÃO FUNCIONOU');
    console.log('Vamos testar endpoints de informação...');
    
    await testarEndpointInfo();
    
    console.log('\n\n💡 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se a API key está correta');
    console.log('2. Verificar se a API key precisa ser ativada');
    console.log('3. Verificar se há IP whitelist');
    console.log('4. Contatar o suporte da BIREME');
    console.log('5. Verificar a documentação em: https://docs.bvsalud.org/');
  } else {
    console.log('\n\n✅ AUTENTICAÇÃO DESCOBERTA COM SUCESSO!');
  }
}

main();