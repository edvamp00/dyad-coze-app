# dyad-coze-app

Projeto Next.js para integrar Coze com chat e API.

## Como usar

1. **Configure as chaves do Coze**  
   Na primeira vez, você vai precisar criar um arquivo `.env.local` (as instruções vão aparecer na interface e também estão neste README).

2. **Suba para a Vercel**  
   Após terminar tudo, você pode publicar facilmente usando o botão “Deploy to Vercel” ou conectando seu repositório.

## Estrutura do Projeto

- `pages/index.js`: Interface web do chat.
- `pages/api/ask.js`: Endpoint API de perguntas para o Coze.
- `lib/config.js`: Utilitário para ler as chaves de configuração.
- `.env.example`: Exemplo do arquivo de configuração local.

## Como configurar o Coze

Crie um arquivo chamado `.env.local` na raiz do projeto com este conteúdo:

```
COZE_BOT_ID=sua_bot_id_aqui
COZE_API_KEY=sua_api_key_aqui
```

Troque os valores acima pelas suas chaves do Coze.

## Como rodar localmente

```bash
npm install
npm run dev
```

## Dúvidas?

Se precisar de ajuda, peça aqui na conversa!
