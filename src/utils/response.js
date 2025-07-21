/**
 * Create standardized HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {object} payload - Response payload
 * @returns {object} Formatted response object
 */
export const createResponse = (statusCode, payload) => {
  const responseObj = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
    },
    body: JSON.stringify(payload)
  };
  
  console.log('Returning response:', JSON.stringify(responseObj, null, 2));
  return responseObj;
}; 