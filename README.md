# EchoDoTTT

Projeto organizado com estrutura clara e bem definida.

## Estrutura do Projeto

```
EchoDoTTT/
├── docs/                    # Documentações do projeto
│   ├── DYNAMODB_SETUP.md
│   ├── LOGGER_DOCUMENTATION.md
│   ├── LOGGER_IMPLEMENTATION_SUMMARY.md
│   ├── MIGRATION_SUMMARY.md
│   └── TIMESTAMP_FEATURE.md
├── packages/                # Arquivos de package/backup
│   ├── package.zip
│   └── package__old.zip
├── tests/                   # Arquivos de teste
│   ├── test-config.js
│   ├── test-dynamodb.js
│   ├── test-logger.js
│   ├── test-timestamp.js
│   ├── test-timestamp-simple.js
│   └── test-validation.js
├── examples/                # Arquivos de exemplo e configuração
│   ├── dynamodb-prompt-example.json
│   ├── example-with-timestamp.json
│   └── item.json
├── src/                     # Código fonte principal
│   ├── config.js
│   ├── handler.js
│   ├── index.js
│   ├── item.json
│   ├── prompt.txt
│   ├── llm/
│   │   ├── groqClient.js
│   │   ├── index.js
│   │   └── openaiClient.js
│   └── utils/
│       ├── json.js
│       ├── loadPrompt.js
│       ├── logger.js
│       ├── response.js
│       └── validation.js
├── package.json             # Configuração do projeto
├── package-lock.json        # Lock de dependências
├── env.example              # Exemplo de variáveis de ambiente
├── index.js                 # Ponto de entrada principal
└── .gitignore              # Arquivos ignorados pelo Git
```

## Organização

- **docs/**: Contém toda a documentação do projeto
- **packages/**: Arquivos de backup e packages
- **tests/**: Todos os arquivos de teste
- **examples/**: Arquivos de exemplo e configuração
- **src/**: Código fonte principal do projeto

## Como usar

1. Instale as dependências: `npm install`
2. Configure as variáveis de ambiente baseado no `env.example`
3. Execute os testes: `node tests/test-*.js`
4. Execute o projeto: `node index.js` 