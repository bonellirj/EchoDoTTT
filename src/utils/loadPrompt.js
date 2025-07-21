import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CONFIG } from '../config.js';

let cachedPrompt = null;

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = DYNAMODB_CONFIG.tableName;
const PROMPT_ID = DYNAMODB_CONFIG.promptId;

export const loadSystemPrompt = async () => {

  if (cachedPrompt !== null) {
    console.log(`Loading prompt from cache: ${cachedPrompt}`);
    return cachedPrompt;
  }

  try {
    console.log(`Loading prompt from DynamoDB table: ${TABLE_NAME}, prompt_id: ${PROMPT_ID}`);
    
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        prompt_id: PROMPT_ID
      }
    });

    const response = await docClient.send(command);
    
    if (!response.Item) {
      throw new Error(`Prompt not found in DynamoDB: prompt_id=${PROMPT_ID}`);
    }

    if (!response.Item.content || typeof response.Item.content !== 'string') {
      throw new Error(`Invalid prompt content in DynamoDB: prompt_id=${PROMPT_ID}`);
    }

    let promptContent = response.Item.content;
    
    // Replace the dynamic date placeholder with current time
    promptContent = promptContent.replace('${new Date().toISOString()}', new Date().toISOString()).trim();
    
    // Armazena no cache para esta execução
    cachedPrompt = promptContent;
    
    console.log('Prompt loaded successfully from DynamoDB');
    return promptContent;
    
  } catch (error) {
    console.error('Error loading prompt from DynamoDB:', error);
    
    // Determina o tipo de erro para melhor tratamento
    if (error.name === 'ResourceNotFoundException') {
      throw new Error(`DynamoDB table not found: ${TABLE_NAME}`);
    } else if (error.name === 'AccessDeniedException') {
      throw new Error(`Access denied to DynamoDB table: ${TABLE_NAME}`);
    } else if (error.name === 'ProvisionedThroughputExceededException') {
      throw new Error(`DynamoDB throughput exceeded for table: ${TABLE_NAME}`);
    } else if (error.message.includes('Prompt not found')) {
      throw new Error(`Prompt configuration not found: prompt_id=${PROMPT_ID}`);
    } else if (error.message.includes('Invalid prompt content')) {
      throw new Error(`Invalid prompt content in DynamoDB: prompt_id=${PROMPT_ID}`);
    } else {
      throw new Error(`Failed to load prompt from DynamoDB: ${error.message}`);
    }
  }
}; 