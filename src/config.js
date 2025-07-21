import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// DynamoDB Configuration (optional - defaults are used if not set)
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const DYNAMODB_PROMPT_ID = process.env.DYNAMODB_PROMPT_ID;

export const LLM_CONFIG = {
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: GROQ_API_KEY,
    defaultModel: 'llama3-8b-8192',
    temperature: 0.1,
    maxTokens: 200
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: OPENAI_API_KEY,
    defaultModel: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 200
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