import fetch from 'node-fetch';
import { LLM_CONFIG, HEADERS } from '../config.js';

/**
 * Call Groq API
 * @param {string} content - User content to send
 * @param {string} systemPrompt - System prompt to use
 * @returns {Promise<string>} LLM response
 */
export async function callGroq(content, systemPrompt) {
  const config = LLM_CONFIG.groq;
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
    console.error('Groq API error:', res.status, text);
    throw new Error(`Groq API returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content_response = data.choices?.[0]?.message?.content?.trim();
  
  if (!content_response) {
    console.error('Empty content from Groq API:', data);
    throw new Error('Groq API returned empty content');
  }

  return content_response;
} 