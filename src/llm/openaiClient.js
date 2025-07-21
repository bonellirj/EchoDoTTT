import fetch from 'node-fetch';
import { LLM_CONFIG, HEADERS } from '../config.js';

/**
 * Call OpenAI API
 * @param {string} content - User content to send
 * @param {string} systemPrompt - System prompt to use
 * @returns {Promise<string>} LLM response
 */
export async function callOpenAI(content, systemPrompt) {
  const config = LLM_CONFIG.openai;
  const payload = {
    model: config.defaultModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens
  };

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: HEADERS(config.apiKey),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('OpenAI API error:', res.status, text);
    throw new Error(`OpenAI API returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content_response = data.choices?.[0]?.message?.content?.trim();
  
  if (!content_response) {
    console.error('Empty content from OpenAI API:', data);
    throw new Error('OpenAI API returned empty content');
  }

  return content_response;
} 