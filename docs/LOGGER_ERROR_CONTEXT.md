# Logger Error Context Enhancement

## Visão Geral

Este documento descreve as melhorias implementadas no sistema de logging para incluir o texto original e o JSON da task nos logs de erro enviados para a API EchoDo.

## Mudanças Implementadas

### 1. Métodos de Log Aprimorados

#### `logRequestError()`
- **Antes**: `logRequestError(error, statusCode, transactionId)`
- **Depois**: `logRequestError(error, statusCode, transactionId, originalText = null, taskJson = null)`

**Campos adicionais no metadata:**
- `originalText`: Texto original do usuário (limitado a 500 caracteres)
- `taskJson`: JSON da task que estava sendo processada

#### `logValidationError()`
- **Antes**: `logValidationError(errorMessage, transactionId)`
- **Depois**: `logValidationError(errorMessage, transactionId, originalText = null)`

**Campos adicionais no metadata:**
- `originalText`: Texto original que falhou na validação

### 2. Novos Métodos de Log

#### `logLLMProcessingError()`
```javascript
async logLLMProcessingError(error, provider, model, transactionId, originalText = null, taskJson = null)
```

**Campos no metadata:**
- `errorCode`: Código do erro
- `errorMessage`: Mensagem do erro
- `llmProvider`: Provedor LLM usado
- `llmModel`: Modelo LLM usado
- `originalText`: Texto original do usuário
- `taskJson`: JSON da task sendo processada
- `action`: 'llm_processing_error'

#### `logTaskProcessingError()`
```javascript
async logTaskProcessingError(error, transactionId, originalText = null, taskJson = null, processingStage = 'unknown')
```

**Campos no metadata:**
- `errorCode`: Código do erro
- `errorMessage`: Mensagem do erro
- `processingStage`: Estágio onde o erro ocorreu (validation, llm, response, etc.)
- `originalText`: Texto original do usuário
- `taskJson`: JSON da task sendo processada
- `action`: 'task_processing_error'

### 3. Captura de Contexto nos Erros

#### Modificações no `llm/index.js`
Todos os erros agora incluem contexto adicional:

```javascript
const error = new Error('Error message');
error.originalText = userText;        // Texto original do usuário
error.taskJson = JSON.stringify(parsed); // JSON da task
throw error;
```

**Pontos onde o contexto é adicionado:**
- Erro de timeout/unavailable do LLM
- Resposta vazia ou inválida do LLM
- Falha no parsing JSON
- Erro retornado pelo LLM
- Estrutura de task inválida
- Data de vencimento no passado

#### Modificações no `handler.js`
Os logs de erro agora capturam o contexto disponível:

```javascript
const originalText = error.originalText || userText;
const taskJson = error.taskJson || null;
await echoDoLogger.logRequestError(error, 500, userTimestamp, originalText, taskJson);
```

## Benefícios

### 1. Debugging Melhorado
- **Contexto Completo**: Todos os logs de erro agora incluem o texto original e o JSON da task
- **Rastreabilidade**: Possibilidade de reproduzir exatamente o que causou o erro
- **Análise de Padrões**: Identificação de padrões de erro relacionados a tipos específicos de input

### 2. Monitoramento Aprimorado
- **Dados Estruturados**: Informações organizadas em campos específicos no metadata
- **Filtros Avançados**: Possibilidade de filtrar logs por tipo de erro, estágio de processamento, etc.
- **Métricas Detalhadas**: Análise de quais tipos de input causam mais erros

### 3. Suporte ao Cliente
- **Reprodução de Problemas**: Equipe de suporte pode reproduzir exatamente o cenário de erro
- **Diagnóstico Rápido**: Identificação imediata do que causou o problema
- **Melhorias Baseadas em Dados**: Decisões de melhoria baseadas em dados reais de erro

## Exemplo de Log de Erro

```json
{
  "message": "LLM processing failed with groq: API rate limit exceeded",
  "status": 500,
  "level": "error",
  "transactionId": "1703123456789",
  "system": "EchoDo",
  "module": "TTT",
  "userId": "NA",
  "meta": {
    "errorCode": "rate_limit",
    "errorMessage": "API rate limit exceeded",
    "llmProvider": "groq",
    "llmModel": "llama3-8b-8192",
    "originalText": "Lembre-me de comprar leite amanhã às 10h",
    "taskJson": "{\"task\": \"Comprar leite\", \"due_date\": \"2024-01-15T10:00:00\"}",
    "action": "llm_processing_error"
  }
}
```

## Compatibilidade

### Backward Compatibility
- Todos os novos parâmetros são opcionais
- Métodos existentes continuam funcionando sem modificação
- Logs antigos não são afetados

### Migração
- Nenhuma migração necessária
- Novos campos são adicionados automaticamente quando disponíveis
- Sistema continua funcionando mesmo sem os novos campos

## Testes

### Arquivo de Teste Atualizado
O arquivo `tests/test-logger.js` foi atualizado para incluir testes dos novos métodos:

- Teste do `logRequestError` com contexto
- Teste do `logValidationError` com texto original
- Teste do `logLLMProcessingError` com contexto completo
- Teste do `logTaskProcessingError` com estágio de processamento

### Como Executar os Testes
```bash
node tests/test-logger.js
```

## Monitoramento

### Campos Importantes para Monitoramento
- `meta.originalText`: Analisar padrões de input problemáticos
- `meta.taskJson`: Verificar se há problemas específicos com certas estruturas de task
- `meta.processingStage`: Identificar em qual estágio ocorrem mais erros
- `meta.llmProvider`: Comparar performance entre diferentes provedores LLM

### Alertas Recomendados
- Taxa de erro por estágio de processamento
- Padrões de texto que causam mais erros
- Problemas específicos com certos provedores LLM
- Estruturas de task que falham frequentemente 