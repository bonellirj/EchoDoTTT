import { validateInput } from './src/utils/validation.js';
import { loadSystemPrompt } from './src/utils/loadPrompt.js';

// Teste da validação de timestamp
console.log('=== Teste de Validação de Timestamp ===');

const testCases = [
  {
    name: 'Timestamp válido ISO 8601',
    event: {
      text: 'Teste de timestamp',
      userTimestamp: '2024-12-19T10:30:00.000Z'
    }
  },
  {
    name: 'Timestamp inválido',
    event: {
      text: 'Teste de timestamp inválido',
      userTimestamp: 'data-invalida'
    }
  },
  {
    name: 'Sem timestamp (deve usar atual)',
    event: {
      text: 'Teste sem timestamp'
    }
  },
  {
    name: 'Timestamp via API Gateway',
    event: {
      body: JSON.stringify({
        text: 'Teste via API Gateway',
        userTimestamp: '2024-12-19T15:00:00.000Z'
      })
    }
  }
];

for (const testCase of testCases) {
  console.log(`\n--- ${testCase.name} ---`);
  try {
    const result = validateInput(testCase.event);
    console.log('Resultado:', {
      userText: result.userText,
      selectedLLM: result.selectedLLM,
      userTimestamp: result.userTimestamp
    });
  } catch (error) {
    console.log('Erro:', error.message);
  }
}

// Teste do carregamento de prompt com timestamp
console.log('\n=== Teste de Carregamento de Prompt ===');

async function testPromptLoading() {
  try {
    // Teste sem timestamp (deve usar atual)
    console.log('\n--- Carregando prompt sem timestamp ---');
    const promptWithoutTimestamp = await loadSystemPrompt();
    console.log('Prompt carregado (sem timestamp):', promptWithoutTimestamp.substring(0, 100) + '...');
    
    // Teste com timestamp específico
    console.log('\n--- Carregando prompt com timestamp ---');
    const testTimestamp = '2024-12-19T10:30:00.000Z';
    const promptWithTimestamp = await loadSystemPrompt(testTimestamp);
    console.log('Prompt carregado (com timestamp):', promptWithTimestamp.substring(0, 100) + '...');
    
    // Verificar se o timestamp foi substituído
    const hasTimestamp = promptWithTimestamp.includes(testTimestamp);
    console.log('Timestamp foi substituído no prompt:', hasTimestamp);
    
  } catch (error) {
    console.log('Erro ao carregar prompt:', error.message);
  }
}

testPromptLoading(); 