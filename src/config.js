import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL;
const GROQ_DEFAULT_MODEL = process.env.GROQ_DEFAULT_MODEL;
const GROQ_ENDPOINT = process.env.GROQ_ENDPOINT;
const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
const GROQ_TEMPERATURE = parseFloat(process.env.GROQ_TEMPERATURE) || 0.1;
const OPENAI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.1;
const GROQ_MAX_TOKENS = parseInt(process.env.GROQ_MAX_TOKENS) || 200;
const OPENAI_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS) || 200;

// DynamoDB Configuration (optional - defaults are used if not set)
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const DYNAMODB_PROMPT_ID = process.env.DYNAMODB_PROMPT_ID;

export const LLM_CONFIG = {
  groq: {
    endpoint: GROQ_ENDPOINT,
    apiKey: GROQ_API_KEY,
    defaultModel: GROQ_DEFAULT_MODEL,
    temperature: GROQ_TEMPERATURE,
    maxTokens: GROQ_MAX_TOKENS
  },
  openai: {
    endpoint: OPENAI_ENDPOINT,
    apiKey: OPENAI_API_KEY,
    defaultModel: OPENAI_DEFAULT_MODEL,
    temperature: OPENAI_TEMPERATURE,
    maxTokens: OPENAI_MAX_TOKENS
  }
};

export const HEADERS = (apiKey) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
});

export const DYNAMODB_CONFIG = {
  tableName: DYNAMODB_TABLE_NAME,
  promptId: DYNAMODB_PROMPT_ID
}; 