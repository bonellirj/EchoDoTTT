/**
 * Validate if response has valid task structure
 * @param {object} data - Response data to validate
 * @returns {boolean} True if valid task structure
 */
export const isValidTaskResponse = (data) =>
  typeof data?.title === 'string' &&
  typeof data?.description === 'string' &&
  typeof data?.due_date === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data.due_date);

/**
 * Check if ISO date is in the past
 * @param {string} isoDate - ISO date string
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (isoDate) => {
  try {
    const parsed = new Date(isoDate);
    return parsed.getTime() < Date.now();
  } catch {
    return true;
  }
};

/**
 * Validate user timestamp
 * @param {string} timestamp - User provided timestamp
 * @returns {string|null} Validated timestamp or null if invalid
 */
export const validateUserTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.log('Invalid timestamp format:', timestamp);
      return null;
    }
    return date.toISOString();
  } catch (error) {
    console.log('Error parsing timestamp:', timestamp, error);
    return null;
  }
};

/**
 * Validate and extract input from event
 * @param {object} event - Lambda event
 * @returns {object} Object with userText, selectedLLM, and userTimestamp
 * @throws {Error} If input is invalid
 */
export const validateInput = (event) => {
  let userText, selectedLLM, userTimestamp;
  
  // Handle different invocation sources
  if (event.body) {
    // API Gateway invocation
    let bodyString = event.body;
    
    // Handle base64 encoded body from API Gateway
    if (event.isBase64Encoded) {
      console.log('Decoding base64 body');
      bodyString = Buffer.from(event.body, 'base64').toString('utf-8');
      console.log('Decoded body:', bodyString);
    }
    
    const body = typeof bodyString === 'string' ? JSON.parse(bodyString) : bodyString;
    userText = body?.text;
    selectedLLM = body?.llm || 'groq'; // Default to groq if not specified
    userTimestamp = body?.userTimestamp; // Optional user timestamp
    console.log('Parsed body from API Gateway:', body);
    console.log('Selected LLM:', selectedLLM, 'Type:', typeof selectedLLM);
    console.log('Body.llm value:', body?.llm, 'Type:', typeof body?.llm);
    console.log('User timestamp:', userTimestamp);
  } else if (event.text) {
    // Direct Lambda invocation
    userText = event.text;
    selectedLLM = event.llm || 'groq';
    userTimestamp = event.userTimestamp; // Optional user timestamp
    console.log('Direct invocation with text:', userText, 'LLM:', selectedLLM);
    console.log('Event.llm value:', event.llm, 'Type:', typeof event.llm);
    console.log('User timestamp:', userTimestamp);
  } else {
    console.log('No valid input found in event');
  }

  if (!userText || typeof userText !== 'string') {
    console.log('Invalid userText:', userText, 'Type:', typeof userText);
    throw new Error('Missing or invalid input');
  }

  // Validate user timestamp if provided
  const validatedTimestamp = userTimestamp;
  // const validatedTimestamp = validateUserTimestamp(userTimestamp);
  if (userTimestamp && !validatedTimestamp) {
    console.log('Invalid user timestamp provided:', userTimestamp);
    // Don't throw error, just log and continue without timestamp
  }

  return { userText, selectedLLM, userTimestamp: validatedTimestamp };
}; 