import axios from 'axios';

export default async function handler(req, res) {
    // 1. Verifica se o método é POST (padrão para APIs)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    // 2. Pega as chaves secretas das variáveis de ambiente da Vercel
    const botId = process.env.COZE_BOT_ID;
    const apiKey = process.env.COZE_API_KEY;

    if (!botId || !apiKey) {
        return res.status(500).json({ error: 'As variáveis de ambiente COZE_BOT_ID e COZE_API_KEY não foram configuradas na Vercel.' });
    }

    try {
        // 3. Extrai a última mensagem do usuário do corpo da requisição (formato OpenAI)
        const openAIMessages = req.body.messages || [];
        const userMessage = openAIMessages.find(msg => msg.role === 'user');

        if (!userMessage || !userMessage.content) {
            return res.status(400).json({ error: 'Nenhuma mensagem de usuário encontrada no corpo da requisição.' });
        }
        const query = userMessage.content;

        // 4. Monta a requisição para a API da Coze
        const cozePayload = {
            bot_id: botId,
            user: "dyad-user-123", // Um identificador de usuário genérico
            query: query,
            stream: false
        };

        const cozeHeaders = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Host': 'api.coze.com',
            'Connection': 'keep-alive'
        };

        // 5. Chama a API da Coze
        const cozeResponse = await axios.post('https://api.coze.com/open_api/v2/chat', cozePayload, { headers: cozeHeaders });

        // 6. Extrai a resposta de texto da Coze
        let assistantResponse = "Desculpe, não consegui obter uma resposta.";
        if (cozeResponse.data.messages) {
            const assistantMessage = cozeResponse.data.messages.find(msg => msg.type === 'answer');
            if (assistantMessage) {
                assistantResponse = assistantMessage.content;
            }
        }

        // 7. Formata a resposta no padrão que a Dyad/OpenAI espera
        const openAIResponse = {
            id: cozeResponse.data.conversation_id || 'chatcmpl-123',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'gpt-3.5-turbo-0125', // Nome de modelo fixo, a Dyad precisa disso
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: assistantResponse,
                },
                finish_reason: 'stop',
            }],
            usage: {
                prompt_tokens: 0, // A Coze não informa isso, então deixamos 0
                completion_tokens: 0,
                total_tokens: 0,
            },
        };

        // 8. Envia a resposta formatada de volta para a Dyad
        res.status(200).json(openAIResponse);

    } catch (error) {
        console.error('Erro ao chamar a API da Coze:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}
