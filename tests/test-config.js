import { LLM_CONFIG } from './src/config.js';

console.log('Configuração dos LLMs:');
console.log('LLM_CONFIG:', JSON.stringify(LLM_CONFIG, null, 2));

console.log('\nVerificando chaves de API:');
console.log('GROQ_API_KEY configurada:', !!LLM_CONFIG.groq.apiKey);
console.log('OPENAI_API_KEY configurada:', !!LLM_CONFIG.openai.apiKey);

console.log('\nLLMs disponíveis:', Object.keys(LLM_CONFIG));

// Teste de seleção de LLM
const testLLM = 'openai';
console.log(`\nTestando seleção do LLM '${testLLM}':`);
console.log('LLM existe na configuração:', !!LLM_CONFIG[testLLM]);
if (LLM_CONFIG[testLLM]) {
  console.log('Configuração do LLM:', {
    endpoint: LLM_CONFIG[testLLM].endpoint,
    hasApiKey: !!LLM_CONFIG[testLLM].apiKey,
    model: LLM_CONFIG[testLLM].defaultModel
  });
} 