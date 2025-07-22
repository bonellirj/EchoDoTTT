# Logger Implementation Summary

## Visão Geral

O sistema de logging foi implementado para centralizar o envio de logs para a API EchoDo, incluindo **contexto completo de erro** com texto original e JSON da task.

## Arquitetura

### Classe Principal
- **EchoDoLogger**: Serviço centralizado para envio de logs
- **Singleton Pattern**: Uma única instância para toda a aplicação
- **Campos Fixos**: system, module, userId configurados uma vez

### Métodos Principais
- `sendLog()` - Método base para envio de logs
- `info()` - Log de informação
- `error()` - Log de erro
- `warn()` - Log de warning
- `debug()` - Log de debug

### Métodos Específicos de Contexto
- `logRequestStart()` - Início de requisição
- `logRequestSuccess()` - Sucesso de requisição
- `logRequestError()` - **Erro de requisição com contexto completo**
- `logValidationError()` - **Erro de validação com texto original**
- `logLLMProcessing()` - Processamento LLM
- `logLLMProcessingError()` - **Erro de processamento LLM com contexto**
- `logTaskProcessingError()` - **Erro de processamento de task com estágio**

## Funcionalidades de Contexto de Erro

### 1. Captura de Texto Original
- **Campo**: `meta.originalText`
- **Limite**: 500 caracteres (truncado se necessário)
- **Disponível em**: Todos os logs de erro
- **Fonte**: Texto original do usuário que causou o erro

### 2. Captura de JSON da Task
- **Campo**: `meta.taskJson`
- **Formato**: String JSON da task sendo processada
- **Disponível em**: Logs de erro de processamento
- **Fonte**: Resposta do LLM ou estrutura de task

### 3. Estágio de Processamento
- **Campo**: `meta.processingStage`
- **Valores**: validation, llm, response, unknown
- **Disponível em**: `logTaskProcessingError()`
- **Propósito**: Identificar onde o erro ocorreu

## Implementação Técnica

### Modificações no Logger (`src/utils/logger.js`)

#### Métodos Aprimorados
```javascript
// Antes
async logRequestError(error, statusCode, transactionId)

// Depois
async logRequestError(error, statusCode, transactionId, originalText = null, taskJson = null)
```

#### Novos Métodos
```javascript
async logLLMProcessingError(error, provider, model, transactionId, originalText = null, taskJson = null)
async logTaskProcessingError(error, transactionId, originalText = null, taskJson = null, processingStage = 'unknown')
```

### Modificações no Processamento (`src/llm/index.js`)

#### Captura de Contexto
```javascript
const error = new Error('Error message');
error.originalText = userText;        // Texto original
error.taskJson = JSON.stringify(parsed); // JSON da task
throw error;
```

**Pontos de Captura:**
- Timeout/unavailable do LLM
- Resposta vazia ou inválida
- Falha no parsing JSON
- Erro retornado pelo LLM
- Estrutura de task inválida
- Data de vencimento no passado

### Modificações no Handler (`src/handler.js`)

#### Uso do Contexto
```javascript
const originalText = error.originalText || userText;
const taskJson = error.taskJson || null;
await echoDoLogger.logRequestError(error, 500, userTimestamp, originalText, taskJson);
```

## Estrutura de Log

### Exemplo de Log com Contexto
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

## Benefícios

### 1. Debugging Aprimorado
- **Contexto Completo**: Texto original e JSON da task em todos os erros
- **Rastreabilidade**: Reprodução exata do cenário de erro
- **Análise de Padrões**: Identificação de padrões problemáticos

### 2. Monitoramento Avançado
- **Dados Estruturados**: Informações organizadas em campos específicos
- **Filtros Avançados**: Filtros por tipo de erro, estágio, provedor LLM
- **Métricas Detalhadas**: Análise de performance e problemas

### 3. Suporte ao Cliente
- **Reprodução de Problemas**: Equipe pode reproduzir cenários exatos
- **Diagnóstico Rápido**: Identificação imediata da causa
- **Melhorias Baseadas em Dados**: Decisões baseadas em dados reais

## Compatibilidade

### Backward Compatibility
- ✅ Todos os novos parâmetros são opcionais
- ✅ Métodos existentes continuam funcionando
- ✅ Logs antigos não são afetados
- ✅ Sistema funciona mesmo sem novos campos

### Migração
- ✅ Nenhuma migração necessária
- ✅ Novos campos adicionados automaticamente
- ✅ Funcionamento contínuo garantido

## Testes

### Cobertura de Testes
- ✅ Testes básicos de todos os métodos
- ✅ Testes com contexto de erro
- ✅ Testes dos novos métodos específicos
- ✅ Validação de campos opcionais

### Execução
```bash
node tests/test-logger.js
```

## Monitoramento Recomendado

### Alertas Importantes
- Taxa de erro por estágio de processamento
- Padrões de texto que causam mais erros
- Problemas específicos com provedores LLM
- Estruturas de task que falham frequentemente

### Métricas de Interesse
- `meta.originalText`: Padrões de input problemáticos
- `meta.taskJson`: Problemas com estruturas específicas
- `meta.processingStage`: Estágios com mais falhas
- `meta.llmProvider`: Performance por provedor

## Documentação Relacionada

- [Logger Documentation](./LOGGER_DOCUMENTATION.md) - Documentação completa da API
- [Logger Error Context](./LOGGER_ERROR_CONTEXT.md) - Detalhes das melhorias de contexto
- [Migration Summary](./MIGRATION_SUMMARY.md) - Resumo de migrações 