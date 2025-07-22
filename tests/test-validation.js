import { validateInput } from './src/utils/validation.js';

// Teste com o evento que você enviou
const testEvent = {
  "body": "{\"text\": \"Enviar o relatório financeiro amanhã às 10h para o gerente.\", \"llm\": \"openai\"}"
};

console.log('Testando evento:', JSON.stringify(testEvent, null, 2));

try {
  const result = validateInput(testEvent);
  console.log('Resultado da validação:', result);
} catch (error) {
  console.error('Erro na validação:', error.message);
} 