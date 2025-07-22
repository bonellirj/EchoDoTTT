# Funcionalidade de Timestamp do Usuário

## Visão Geral

A lambda agora suporta receber um timestamp opcional (`userTimestamp`) na chamada que representa a data e hora local do usuário. Este timestamp é usado para enriquecer o prompt da LLM antes da chamada para a API.

## Como Funciona

### 1. Recebimento do Timestamp
- O campo `userTimestamp` é opcional na requisição
- Aceita formatos ISO 8601 (ex: `"2024-12-19T10:30:00.000Z"`)
- Se não fornecido, usa o timestamp atual do servidor

### 2. Validação
- O timestamp é validado para garantir formato correto
- Se inválido, é ignorado e usa o timestamp atual
- Não causa erro na requisição, apenas log de aviso

### 3. Enriquecimento do Prompt
- O timestamp é usado para substituir o placeholder `${new Date().toISOString()}` no prompt
- Permite que a LLM use a data/hora local do usuário para interpretar expressões relativas como "amanhã", "em 1 hora", etc.

## Formato da Requisição

### Via API Gateway (JSON no body)
```json
{
  "text": "Ligar para o cliente amanhã às 14h",
  "llm": "groq",
  "userTimestamp": "2024-12-19T10:30:00.000Z"
}
```

### Via Invocação Direta da Lambda
```json
{
  "text": "Ligar para o cliente amanhã às 14h",
  "llm": "groq",
  "userTimestamp": "2024-12-19T10:30:00.000Z"
}
```

## Exemplos de Uso

### Exemplo 1: Usuário em São Paulo (UTC-3)
```json
{
  "text": "Reunião amanhã às 9h",
  "userTimestamp": "2024-12-19T15:00:00.000Z"
}
```
- Timestamp do usuário: 19/12/2024 12:00 (horário local)
- "Amanhã às 9h" será interpretado como 20/12/2024 09:00 (horário local)

### Exemplo 2: Usuário em Londres (UTC+0)
```json
{
  "text": "Call client in 2 hours",
  "userTimestamp": "2024-12-19T15:00:00.000Z"
}
```
- Timestamp do usuário: 19/12/2024 15:00 (horário local)
- "In 2 hours" será interpretado como 19/12/2024 17:00 (horário local)

## Benefícios

1. **Precisão Temporal**: A LLM pode interpretar corretamente expressões relativas baseadas no horário local do usuário
2. **Flexibilidade**: Funciona com qualquer fuso horário
3. **Compatibilidade**: Não quebra funcionalidades existentes (campo opcional)
4. **Robustez**: Validação adequada e fallback para timestamp atual

## Logs e Debug

A funcionalidade adiciona logs para facilitar o debug:
- `User timestamp: [timestamp]` - mostra o timestamp recebido
- `Timestamp used for prompt: [timestamp]` - mostra qual timestamp foi usado no prompt
- `Invalid user timestamp provided: [timestamp]` - aviso quando timestamp é inválido

## Compatibilidade

- ✅ **Totalmente compatível** com chamadas existentes
- ✅ **Campo opcional** - não quebra código atual
- ✅ **Fallback automático** para timestamp atual se não fornecido
- ✅ **Validação robusta** - ignora timestamps inválidos sem erro 