import fetch from 'node-fetch';

/**
 * Logger service for EchoDo API
 * Centralizes log sending with fixed and dynamic fields
 */
class EchoDoLogger {
  constructor() {
    this.apiUrl = 'https://api.echodo.chat/Log';
    this.authorization = 'WsduXaA63a1YZSvgkdWyU81Z';
    
    // Fixed fields that don't change
    this.fixedFields = {
      system: 'EchoDo',
      module: 'TTT',
      userId: 'NA'
    };
  }

  /**
   * Send log to EchoDo API
   * @param {Object} options - Log options
   * @param {string} options.message - Log message
   * @param {number} options.status - HTTP status code
   * @param {string} options.level - Log level (info, error, warn, debug)
   * @param {string} options.transactionId - Transaction ID (usually timestamp)
   * @param {Object} options.meta - Additional metadata
   * @returns {Promise<Object>} API response
   */
  async sendLog({ message, status, level = 'info', transactionId, meta = {} }) {
    try {
      const logData = {
        message,
        status,
        level,
        transactionId,
        system: this.fixedFields.system,
        module: this.fixedFields.module,
        userId: this.fixedFields.userId,
        meta
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': this.authorization,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        console.error(`Failed to send log to EchoDo API: ${response.status} ${response.statusText}`);
        return { success: false, error: `HTTP ${response.status}` };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error sending log to EchoDo API:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log info level
   * @param {string} message - Log message
   * @param {number} status - HTTP status code
   * @param {string} transactionId - Transaction ID
   * @param {Object} meta - Additional metadata
   */
  async info(message, status, transactionId, meta = {}) {
    return this.sendLog({ message, status, level: 'info', transactionId, meta });
  }

  /**
   * Log error level
   * @param {string} message - Log message
   * @param {number} status - HTTP status code
   * @param {string} transactionId - Transaction ID
   * @param {Object} meta - Additional metadata
   */
  async error(message, status, transactionId, meta = {}) {
    return this.sendLog({ message, status, level: 'error', transactionId, meta });
  }

  /**
   * Log warning level
   * @param {string} message - Log message
   * @param {number} status - HTTP status code
   * @param {string} transactionId - Transaction ID
   * @param {Object} meta - Additional metadata
   */
  async warn(message, status, transactionId, meta = {}) {
    return this.sendLog({ message, status, level: 'warn', transactionId, meta });
  }

  /**
   * Log debug level
   * @param {string} message - Log message
   * @param {number} status - HTTP status code
   * @param {string} transactionId - Transaction ID
   * @param {Object} meta - Additional metadata
   */
  async debug(message, status, transactionId, meta = {}) {
    return this.sendLog({ message, status, level: 'debug', transactionId, meta });
  }

  /**
   * Log request processing start
   * @param {string} userText - User input text
   * @param {string} selectedLLM - Selected LLM provider
   * @param {string} transactionId - Transaction ID
   */
  async logRequestStart(userText, selectedLLM, transactionId) {
    return this.info(
      'Request processing started',
      200,
      transactionId,
      {
        userText: userText.substring(0, 100) + (userText.length > 100 ? '...' : ''),
        selectedLLM,
        action: 'request_start'
      }
    );
  }

  /**
   * Log request processing success
   * @param {Object} result - Processing result
   * @param {string} transactionId - Transaction ID
   */
  async logRequestSuccess(result, transactionId) {
    return this.info(
      'Request processed successfully',
      200,
      transactionId,
      {
        resultType: typeof result,
        action: 'request_success'
      }
    );
  }

  /**
   * Log request processing error with original text and task JSON
   * @param {Error} error - Error object
   * @param {number} statusCode - HTTP status code
   * @param {string} transactionId - Transaction ID
   * @param {string} originalText - Original user input text
   * @param {Object} taskJson - Task JSON that was being processed
   */
  async logRequestError(error, statusCode, transactionId, originalText = null, taskJson = null) {
    const meta = {
      errorCode: error.code || 'unknown',
      errorMessage: error.message,
      action: 'request_error'
    };

    // Include original text if provided
    if (originalText) {
      meta.originalText = originalText.length > 500 ? 
        originalText.substring(0, 500) + '...' : 
        originalText;
    }

    // Include task JSON if provided
    if (taskJson) {
      try {
        meta.taskJson = typeof taskJson === 'string' ? taskJson : JSON.stringify(taskJson);
      } catch (jsonError) {
        meta.taskJson = 'Error serializing task JSON: ' + jsonError.message;
      }
    }

    return this.error(
      `Request processing failed: ${error.message}`,
      statusCode,
      transactionId,
      meta
    );
  }

  /**
   * Log validation error with original text
   * @param {string} errorMessage - Validation error message
   * @param {string} transactionId - Transaction ID
   * @param {string} originalText - Original user input text that failed validation
   */
  async logValidationError(errorMessage, transactionId, originalText = null) {
    const meta = {
      errorType: 'validation_error',
      action: 'validation_failed'
    };

    // Include original text if provided
    if (originalText) {
      meta.originalText = originalText.length > 500 ? 
        originalText.substring(0, 500) + '...' : 
        originalText;
    }

    return this.error(
      `Input validation failed: ${errorMessage}`,
      400,
      transactionId,
      meta
    );
  }

  /**
   * Log LLM processing error with context
   * @param {Error} error - Error object
   * @param {string} provider - LLM provider
   * @param {string} model - LLM model
   * @param {string} transactionId - Transaction ID
   * @param {string} originalText - Original user input text
   * @param {Object} taskJson - Task JSON being processed
   */
  async logLLMProcessingError(error, provider, model, transactionId, originalText = null, taskJson = null) {
    const meta = {
      errorCode: error.code || 'unknown',
      errorMessage: error.message,
      llmProvider: provider,
      llmModel: model,
      action: 'llm_processing_error'
    };

    // Include original text if provided
    if (originalText) {
      meta.originalText = originalText.length > 500 ? 
        originalText.substring(0, 500) + '...' : 
        originalText;
    }

    // Include task JSON if provided
    if (taskJson) {
      try {
        meta.taskJson = typeof taskJson === 'string' ? taskJson : JSON.stringify(taskJson);
      } catch (jsonError) {
        meta.taskJson = 'Error serializing task JSON: ' + jsonError.message;
      }
    }

    return this.error(
      `LLM processing failed with ${provider}: ${error.message}`,
      500,
      transactionId,
      meta
    );
  }

  /**
   * Log LLM processing
   * @param {string} provider - LLM provider
   * @param {string} model - LLM model
   * @param {string} transactionId - Transaction ID
   */
  async logLLMProcessing(provider, model, transactionId) {
    return this.info(
      `LLM processing with ${provider}`,
      200,
      transactionId,
      {
        llmProvider: provider,
        llmModel: model,
        action: 'llm_processing'
      }
    );
  }

  /**
   * Log task processing error with full context
   * @param {Error} error - Error object
   * @param {string} transactionId - Transaction ID
   * @param {string} originalText - Original user input text
   * @param {Object} taskJson - Task JSON that was being processed
   * @param {string} processingStage - Stage where error occurred (validation, llm, response, etc.)
   */
  async logTaskProcessingError(error, transactionId, originalText = null, taskJson = null, processingStage = 'unknown') {
    const meta = {
      errorCode: error.code || 'unknown',
      errorMessage: error.message,
      processingStage,
      action: 'task_processing_error'
    };

    // Include original text if provided
    if (originalText) {
      meta.originalText = originalText.length > 500 ? 
        originalText.substring(0, 500) + '...' : 
        originalText;
    }

    // Include task JSON if provided
    if (taskJson) {
      try {
        meta.taskJson = typeof taskJson === 'string' ? taskJson : JSON.stringify(taskJson);
      } catch (jsonError) {
        meta.taskJson = 'Error serializing task JSON: ' + jsonError.message;
      }
    }

    return this.error(
      `Task processing failed at ${processingStage}: ${error.message}`,
      500,
      transactionId,
      meta
    );
  }
}

// Export singleton instance
export const echoDoLogger = new EchoDoLogger(); 