import { callGroq } from './groqClient.js';
import { callOpenAI } from './openaiClient.js';
import { LLM_CONFIG } from '../config.js';
import { loadSystemPrompt } from '../utils/loadPrompt.js';
import { safeParseJSON } from '../utils/json.js';
import { isValidTaskResponse, isDateInPast } from '../utils/validation.js';

/**
 * Call LLM function that routes to the appropriate provider
 * @param {string} provider - LLM provider ('groq' or 'openai')
 * @param {string} content - User content to send
 * @param {string} systemPrompt - System prompt to use
 * @returns {Promise<string>} LLM response
 */
async function callLLM(provider, content, systemPrompt) {
  switch (provider) {
    case 'groq':
      return await callGroq(content, systemPrompt);
    case 'openai':
      return await callOpenAI(content, systemPrompt);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

/**
 * Process request through LLM and return structured result
 * @param {string} userText - User input text
 * @param {string} selectedLLM - Selected LLM provider
 * @param {string} systemPrompt - System prompt to use
 * @returns {Promise<object>} Processed result
 */
export async function processRequest(userText, selectedLLM, systemPrompt) {
  // Validate LLM selection
  console.log('Validating LLM selection:', selectedLLM, 'Available LLMs:', Object.keys(LLM_CONFIG));
  if (!LLM_CONFIG[selectedLLM]) {
    throw new Error(`Invalid LLM provider. Supported: ${Object.keys(LLM_CONFIG).join(', ')}`);
  }

  // Validate API key for selected LLM
  const config = LLM_CONFIG[selectedLLM];
  console.log('LLM config for', selectedLLM, ':', { hasApiKey: !!config.apiKey, model: config.defaultModel });
  if (!config.apiKey) {
    throw new Error(`${selectedLLM.toUpperCase()} API key not configured`);
  }

  console.log('Processing user input:', userText, 'with LLM:', selectedLLM);

  let llmText;
  try {
    llmText = await callLLM(selectedLLM, userText, systemPrompt);
    console.log('LLM raw response:', llmText);
  } catch (err) {
    console.error('LLM call failed', err);
    throw new Error(`${selectedLLM.toUpperCase()} API timeout or unavailable`);
  }

  if (!llmText || typeof llmText !== 'string') {
    console.error('Invalid LLM response:', llmText);
    throw new Error('LLM returned empty or invalid response');
  }

  let parsed = safeParseJSON(llmText);

  if (!parsed) {
    console.error('Failed to parse LLM response as JSON');
    throw new Error('LLM response could not be parsed as JSON');
  }

  // Handle error responses from LLM
  if (parsed?.error) {
    // Map common error types to standardized codes regardless of language
    let errorCode = 'unknown_error';
    
    const errorText = parsed.error.toLowerCase();
    if (errorText.includes('not') && errorText.includes('valid') && errorText.includes('task') ||
        errorText.includes('não') && errorText.includes('válida') ||
        errorText.includes('no es') && errorText.includes('válida')) {
      errorCode = 'not_a_task';
    } else if (errorText.includes('missing') && errorText.includes('due') ||
               errorText.includes('data') && errorText.includes('ausente') ||
               errorText.includes('falta') && errorText.includes('fecha')) {
      errorCode = 'missing_due_date';
    } else if (errorText.includes('past') && errorText.includes('date') ||
               errorText.includes('passado') ||
               errorText.includes('pasado')) {
      errorCode = 'past_due_date';
    }
    
    const errorMessages = {
      'not_a_task': 'Input is not a valid task request',
      'missing_due_date': 'Task request has no due date', 
      'past_due_date': 'Due date is in the past'
    };
    
    const error = new Error(errorMessages[errorCode] || 'Unknown error from LLM');
    error.code = errorCode;
    error.llmError = parsed.error;
    throw error;
  }

  // Validate task response structure
  if (!isValidTaskResponse(parsed)) {
    console.error('Invalid task structure:', parsed);
    throw new Error('LLM response has invalid task structure');
  }

  // Check if date is in the past
  if (isDateInPast(parsed.due_date)) {
    const error = new Error('Due date is in the past');
    error.code = 'past_due_date';
    throw error;
  }

  return {
    ...parsed,
    meta: {
      llm_provider: selectedLLM,
      model_used: config.defaultModel
    }
  };
} 