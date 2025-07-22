# EchoDo Logger - Documentação

## Visão Geral

O módulo `EchoDoLogger` é um serviço centralizado para envio de logs para a API EchoDo. Ele centraliza os campos fixos e permite personalização dos campos dinâmicos, reduzindo a repetição de código.

## Características

- **Campos Centralizados**: `system`, `module`, `userId`, `Authorization` são configurados uma vez
- **Campos Dinâmicos**: `message`, `status`, `level`, `transactionId`, `meta` são personalizáveis
- **Métodos Especializados**: Métodos específicos para diferentes tipos de log
- **Tratamento de Erros**: Captura e trata erros de envio de logs
- **Transação ID**: Usa o timestamp recebido como identificador de transação

## Instalação

O logger já está integrado ao projeto. Apenas importe:

```javascript
import { echoDoLogger } from './src/utils/logger.js';
```

## Uso Básico

### Métodos Principais

#### 1. Log Genérico
```javascript
await echoDoLogger.sendLog({
  message: "Mensagem personalizada",
  status: 200,
  level: "info", // info, error, warn, debug
  transactionId: "timestamp-123",
  meta: { campo: "valor" }
});
```

#### 2. Logs por Nível
```javascript
// Info
await echoDoLogger.info("Mensagem info", 200, transactionId, { meta: "dados" });

// Error
await echoDoLogger.error("Mensagem erro", 500, transactionId, { error: "detalhes" });

// Warning
await echoDoLogger.warn("Mensagem warning", 422, transactionId, { warning: "motivo" });

// Debug
await echoDoLogger.debug("Mensagem debug", 200, transactionId, { debug: "info" });
```

### Métodos Especializados

#### 1. Log de Início de Requisição
```javascript
await echoDoLogger.logRequestStart(
  "Lembre-me de comprar leite amanhã",
  "groq",
  transactionId
);
```

#### 2. Log de Sucesso de Requisição
```javascript
await echoDoLogger.logRequestSuccess(
  { task: "Comprar leite", due_date: "2024-01-15" },
  transactionId
);
```

#### 3. Log de Erro de Requisição
```javascript
const error = new Error("LLM timeout");
error.code = "llm_timeout";
await echoDoLogger.logRequestError(error, 504, transactionId);
```

#### 4. Log de Erro de Validação
```javascript
await echoDoLogger.logValidationError(
  "Missing required field: userText",
  transactionId
);
```

#### 5. Log de Processamento LLM
```javascript
await echoDoLogger.logLLMProcessing(
  "groq",
  "llama3-8b-8192",
  transactionId
);
```

## Estrutura dos Logs

### Campos Fixos (Centralizados)
```json
{
  "system": "EchoDo",
  "module": "TTT", 
  "userId": "NA",
  "Authorization": "WsduXaA63a1YZSvgkdWyU81Z"
}
```

### Campos Dinâmicos (Personalizáveis)
```json
{
  "message": "Mensagem do log",
  "status": 200,
  "level": "info",
  "transactionId": "timestamp-123",
  "meta": {
    "campo": "valor",
    "acao": "tipo_acao"
  }
}
```

## Exemplo Completo

```javascript
import { echoDoLogger } from './src/utils/logger.js';

async function processarRequisicao(userText, selectedLLM, userTimestamp) {
  try {
    // Log início da requisição
    await echoDoLogger.logRequestStart(userText, selectedLLM, userTimestamp);
    
    // Processamento...
    const resultado = await processarComLLM(userText, selectedLLM);
    
    // Log sucesso
    await echoDoLogger.logRequestSuccess(resultado, userTimestamp);
    
    return resultado;
  } catch (error) {
    // Log erro
    await echoDoLogger.logRequestError(error, 500, userTimestamp);
    throw error;
  }
}
```

## Teste

Execute o arquivo de teste para verificar o funcionamento:

```bash
node test-logger.js
```

## Integração no Handler

O logger já está integrado no `handler.js` principal, registrando:

- Início de requisições
- Erros de validação
- Erros de carregamento de prompt
- Sucesso de processamento
- Erros de processamento
- Erros não tratados

## Configuração

A URL da API e o token de autorização estão configurados no construtor da classe:

```javascript
this.apiUrl = 'https://api.echodo.chat/Log';
this.authorization = 'WsduXaA63a1YZSvgkdWyU81Z';
```

## Tratamento de Erros

O logger captura erros de rede e de API, retornando:

```javascript
// Sucesso
{ success: true, data: responseData }

// Erro
{ success: false, error: "error message" }
```

## Boas Práticas

1. **Sempre use o transactionId**: Use o timestamp recebido como identificador
2. **Mensagens descritivas**: Seja específico sobre o que está sendo logado
3. **Metadados úteis**: Inclua informações relevantes no campo `meta`
4. **Níveis apropriados**: Use o nível correto (info, error, warn, debug)
5. **Não bloqueie o fluxo**: O logger não deve interromper o processamento principal 