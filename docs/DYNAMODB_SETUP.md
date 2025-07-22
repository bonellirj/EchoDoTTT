# Configuração do DynamoDB para EchoDoTTT

## 📋 Pré-requisitos

1. **Tabela DynamoDB**: `EchoDo-Prompt-Configuration`
2. **Chave primária**: `prompt_id` (String)
3. **AWS SDK v3**: Já adicionado ao `package.json`

## 🗄️ Estrutura da Tabela

### Tabela: `EchoDo-Prompt-Configuration`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `prompt_id` | String | **Chave primária** - Identificador único do prompt |
| `content` | String | **Obrigatório** - Conteúdo do prompt do sistema |
| `created_at` | String | Data de criação (ISO 8601) |
| `updated_at` | String | Data de última atualização (ISO 8601) |
| `version` | String | Versão do prompt |

### Item Exemplo

```json
{
  "prompt_id": "text_to_task",
  "content": "You are a productivity assistant...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "version": "1.0"
}
```

## 🔐 Permissões IAM

A Lambda function precisa das seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/EchoDo-Prompt-Configuration"
    }
  ]
}
```

## 🚀 Como Configurar

### 1. Criar a Tabela DynamoDB

```bash
aws dynamodb create-table \
  --table-name EchoDo-Prompt-Configuration \
  --attribute-definitions AttributeName=prompt_id,AttributeType=S \
  --key-schema AttributeName=prompt_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 2. Inserir o Prompt

```bash
aws dynamodb put-item \
  --table-name EchoDo-Prompt-Configuration \
  --item file://dynamodb-prompt-example.json
```

### 3. Verificar a Configuração

```bash
aws dynamodb get-item \
  --table-name EchoDo-Prompt-Configuration \
  --key '{"prompt_id": {"S": "text_to_task"}}'
```

## 🔧 Configuração da Lambda

### Variáveis de Ambiente (Opcional)

Se necessário, você pode configurar as seguintes variáveis de ambiente na Lambda:

- `DYNAMODB_TABLE_NAME`: Nome da tabela (padrão: `EchoDo-Prompt-Configuration`)
- `DYNAMODB_PROMPT_ID`: ID do prompt (padrão: `text_to_task`)

### Região AWS

Certifique-se de que a Lambda e a tabela DynamoDB estejam na mesma região AWS.

## 🧪 Testando

Após a configuração, você pode testar a Lambda com:

```json
{
  "body": "{\"text\": \"Call my mom tomorrow\", \"llm\": \"groq\"}"
}
```

## ⚠️ Tratamento de Erros

O sistema trata os seguintes erros:

- **Tabela não encontrada**: `ResourceNotFoundException`
- **Acesso negado**: `AccessDeniedException`
- **Throughput excedido**: `ProvisionedThroughputExceededException`
- **Prompt não encontrado**: Item com `prompt_id` não existe
- **Conteúdo inválido**: Campo `content` ausente ou não é string

Todos os erros resultam em resposta HTTP 500 com código de erro `prompt_loading_failed`. 