/**
 * Safely parse JSON string, removing markdown code blocks if present
 * @param {string} text - Text to parse as JSON
 * @returns {object|null} Parsed JSON object or null if parsing fails
 */
export const safeParseJSON = (text) => {
  try {
    // Remove markdown code blocks if present
    const cleanText = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('JSON parse error:', error.message, 'Text:', text);
    return null;
  }
}; 