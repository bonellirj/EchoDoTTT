import { processRequest } from './llm/index.js';
import { validateInput } from './utils/validation.js';
import { createResponse } from './utils/response.js';
import { loadSystemPrompt } from './utils/loadPrompt.js';
import { echoDoLogger } from './utils/logger.js';

/**
 * Main Lambda handler - Entry point
 * @param {object} event - Lambda event
 * @returns {object} HTTP response
 */
export const handler = async (event) => {
  try {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    let userText, selectedLLM, userTimestamp;
    
    try {
      const input = validateInput(event);
      userText = input.userText;
      selectedLLM = input.selectedLLM;
      userTimestamp = input.userTimestamp;
      
      // Log request start with transaction ID
      await echoDoLogger.logRequestStart(userText, selectedLLM, userTimestamp);
    } catch (error) {
      // Log validation error with original text if available
      const originalText = event.userText || event.body?.userText || null;
      await echoDoLogger.logValidationError(error.message, event.userTimestamp || 'unknown', originalText);
      
      return createResponse(400, {
        success: false,
        error_code: 'missing_input',
        message: error.message
      });
    }
    
    // Load system prompt with user timestamp if provided
    let systemPrompt;
    try {
      systemPrompt = await loadSystemPrompt(userTimestamp);
    } catch (error) {
      // Log prompt loading error with original text
      await echoDoLogger.logRequestError(error, 500, userTimestamp, userText);
      
      return createResponse(500, {
        success: false,
        error_code: 'prompt_loading_failed',
        message: 'Failed to load system prompt configuration'
      });
    }

    // Process the request
    try {
      console.log('Processing request: userTimestamp', userTimestamp);
      const result = await processRequest(userText, selectedLLM, systemPrompt, userTimestamp);
      
      // Log successful processing
      await echoDoLogger.logRequestSuccess(result, userTimestamp);
      
      return createResponse(200, {
        success: true,
        data: result
      });
    } catch (error) {
      // Log processing error with original text and task JSON
      const originalText = error.originalText || userText;
      const taskJson = error.taskJson || null;
      await echoDoLogger.logRequestError(error, 500, userTimestamp, originalText, taskJson);
      
      // Handle specific error codes
      if (error.code === 'not_a_task') {
        return createResponse(422, {
          success: false,
          error_code: error.code,
          message: error.message,
          llm_error_message: error.llmError
        });
      } else if (error.code === 'missing_due_date') {
        return createResponse(422, {
          success: false,
          error_code: error.code,
          message: error.message,
          llm_error_message: error.llmError
        });
      } else if (error.code === 'past_due_date') {
        return createResponse(422, {
          success: false,
          error_code: error.code,
          message: error.message
        });
      } else if (error.message.includes('Invalid LLM provider')) {
        return createResponse(400, {
          success: false,
          error_code: 'invalid_llm',
          message: error.message
        });
      } else if (error.message.includes('API key not configured')) {
        return createResponse(503, {
          success: false,
          error_code: 'llm_unavailable',
          message: error.message
        });
      } else if (error.message.includes('timeout or unavailable')) {
        return createResponse(504, {
          success: false,
          error_code: 'llm_timeout',
          message: error.message
        });
      } else if (error.message.includes('empty or invalid response')) {
        return createResponse(502, {
          success: false,
          error_code: 'llm_empty_response',
          message: error.message
        });
      } else if (error.message.includes('could not be parsed')) {
        return createResponse(502, {
          success: false,
          error_code: 'llm_bad_response',
          message: error.message
        });
      } else if (error.message.includes('invalid task structure')) {
        return createResponse(502, {
          success: false,
          error_code: 'llm_invalid_structure',
          message: error.message
        });
      }
      
      // Generic error
      return createResponse(500, {
        success: false,
        error_code: 'internal_error',
        message: 'Internal server error'
      });
    }

  } catch (err) {
    console.error('Unhandled error', err);
    
    // Log unhandled error with available context
    const originalText = err.originalText || event.userText || event.body?.userText || null;
    const taskJson = err.taskJson || null;
    await echoDoLogger.logRequestError(err, 500, 'unknown', originalText, taskJson);
    
    return createResponse(500, {
      success: false,
      error_code: 'internal_error',
      message: 'Internal server error'
    });
  }
}; 