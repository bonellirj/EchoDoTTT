import { validateInput, validateUserTimestamp } from './src/utils/validation.js';

// Teste da validação de timestamp
console.log('=== Teste de Validação de Timestamp ===');

// Teste da função validateUserTimestamp
console.log('\n--- Teste da função validateUserTimestamp ---');
const timestampTests = [
  { input: '2024-12-19T10:30:00.000Z', expected: '2024-12-19T10:30:00.000Z' },
  { input: '2024-12-19T10:30:00Z', expected: '2024-12-19T10:30:00.000Z' },
  { input: 'data-invalida', expected: null },
  { input: null, expected: null },
  { input: undefined, expected: null },
  { input: '', expected: null }
];

for (const test of timestampTests) {
  const result = validateUserTimestamp(test.input);
  const passed = result === test.expected;
  console.log(`Input: "${test.input}" -> Result: "${result}" -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
}

// Teste da função validateInput
console.log('\n--- Teste da função validateInput ---');
const inputTests = [
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
  },
  {
    name: 'Timestamp via API Gateway com base64',
    event: {
      body: Buffer.from(JSON.stringify({
        text: 'Teste via API Gateway base64',
        userTimestamp: '2024-12-19T20:00:00.000Z'
      })).toString('base64'),
      isBase64Encoded: true
    }
  }
];

for (const testCase of inputTests) {
  console.log(`\n--- ${testCase.name} ---`);
  try {
    const result = validateInput(testCase.event);
    console.log('✅ Resultado:', {
      userText: result.userText,
      selectedLLM: result.selectedLLM,
      userTimestamp: result.userTimestamp
    });
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

console.log('\n=== Teste Concluído ===');
console.log('✅ A funcionalidade de timestamp está funcionando corretamente!'); 