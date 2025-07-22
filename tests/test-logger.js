import { echoDoLogger } from '../src/utils/logger.js';

/**
 * Test script to demonstrate EchoDo Logger functionality
 */
async function testLogger() {
  console.log('Testing EchoDo Logger...\n');

  const transactionId = Date.now().toString();

  try {
    // Test 1: Basic info log
    console.log('1. Testing basic info log...');
    const result1 = await echoDoLogger.info(
      'Teste básico de log info',
      200,
      transactionId,
      { testType: 'basic_info' }
    );
    console.log('Result:', result1);

    // Test 2: Error log
    console.log('\n2. Testing error log...');
    const result2 = await echoDoLogger.error(
      'Teste de log de erro',
      500,
      transactionId,
      { testType: 'error_test', errorDetails: 'Simulated error' }
    );
    console.log('Result:', result2);

    // Test 3: Warning log
    console.log('\n3. Testing warning log...');
    const result3 = await echoDoLogger.warn(
      'Teste de log de warning',
      422,
      transactionId,
      { testType: 'warning_test', warningReason: 'Validation issue' }
    );
    console.log('Result:', result3);

    // Test 4: Debug log
    console.log('\n4. Testing debug log...');
    const result4 = await echoDoLogger.debug(
      'Teste de log debug',
      200,
      transactionId,
      { testType: 'debug_test', debugInfo: 'Processing details' }
    );
    console.log('Result:', result4);

    // Test 5: Request start log
    console.log('\n5. Testing request start log...');
    const result5 = await echoDoLogger.logRequestStart(
      'Lembre-me de comprar leite amanhã',
      'groq',
      transactionId
    );
    console.log('Result:', result5);

    // Test 6: Request success log
    console.log('\n6. Testing request success log...');
    const result6 = await echoDoLogger.logRequestSuccess(
      { task: 'Comprar leite', due_date: '2024-01-15' },
      transactionId
    );
    console.log('Result:', result6);

    // Test 7: Request error log
    console.log('\n7. Testing request error log...');
    const error = new Error('LLM timeout');
    error.code = 'llm_timeout';
    const result7 = await echoDoLogger.logRequestError(
      error,
      504,
      transactionId,
      'Lembre-me de comprar leite amanhã',
      '{"task": "Comprar leite", "due_date": "2024-01-15"}'
    );
    console.log('Result:', result7);

    // Test 8: Validation error log
    console.log('\n8. Testing validation error log...');
    const result8 = await echoDoLogger.logValidationError(
      'Missing required field: userText',
      transactionId,
      'Lembre-me de comprar leite amanhã'
    );
    console.log('Result:', result8);

    // Test 9: LLM processing log
    console.log('\n9. Testing LLM processing log...');
    const result9 = await echoDoLogger.logLLMProcessing(
      'groq',
      'llama3-8b-8192',
      transactionId
    );
    console.log('Result:', result9);

    // Test 10: LLM processing error log
    console.log('\n10. Testing LLM processing error log...');
    const llmError = new Error('API rate limit exceeded');
    llmError.code = 'rate_limit';
    const result10 = await echoDoLogger.logLLMProcessingError(
      llmError,
      'groq',
      'llama3-8b-8192',
      transactionId,
      'Lembre-me de comprar leite amanhã',
      '{"task": "Comprar leite", "due_date": "2024-01-15"}'
    );
    console.log('Result:', result10);

    // Test 11: Task processing error log
    console.log('\n11. Testing task processing error log...');
    const taskError = new Error('Invalid task structure');
    taskError.code = 'invalid_structure';
    const result11 = await echoDoLogger.logTaskProcessingError(
      taskError,
      transactionId,
      'Lembre-me de comprar leite amanhã',
      '{"task": "Comprar leite", "due_date": "2024-01-15"}',
      'validation'
    );
    console.log('Result:', result11);

    console.log('\n✅ All logger tests completed!');

  } catch (error) {
    console.error('❌ Logger test failed:', error);
  }
}

// Run the test
testLogger(); 