import axios from 'axios';

export default async function handler(req, res) {
    // --- INÍCIO DO NOVO BLOCO DE CÓDIGO ---
    // Configura os cabeçalhos para permitir a comunicação de outros domínios (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Responde ao "pedido de permissão" (OPTIONS request) do navegador
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // --- FIM DO NOVO BLOCO DE CÓDIGO ---

    // 1. Agora, verifica se o método da requisição principal é POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Método ${req.method} não permitido. Use POST.` });
    }

    // Pega as chaves secretas das variáveis de ambiente da Vercel
    const botId = process.env.COZE_BOT_ID;
    const apiKey = process.env.COZE_API_KEY;

    if (!botId || !apiKey) {
        return res.status(500).json({ error: 'As variáveis de ambiente COZE_BOT_ID e COZE_API_KEY não foram configuradas na Vercel.' });
    }

    try {
        // Extrai a última mensagem do usuário do corpo da requisição (formato OpenAI)
        const openAIMessages = req.body.messages || [];
        const userMessage = openAIMessages.find(msg => msg.role === 'user');

        if (!userMessage || !userMessage.content) {
            return res.status(400).json({ error: 'Nenhuma mensagem de usuário encontrada no corpo da requisição.' });
        }
        const query = userMessage.content;

        // Monta a requisição para a API da Coze
        const cozePayload = {
            bot_id: botId,
            user: "dyad-user-123",
            query: query,
            stream: false
        };

        const cozeHeaders = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        };

        // Chama a API da Coze
        const cozeResponse = await axios.post('https://api.coze.com/open_api/v2/chat', cozePayload, { headers: cozeHeaders });

        // Extrai a resposta de texto da Coze
        let assistantResponse = "Desculpe, não consegui obter uma resposta.";
        if (cozeResponse.data.messages) {
            const assistantMessage = cozeResponse.data.messages.find(msg => msg.type === 'answer');
            if (assistantMessage) {
                assistantResponse = assistantMessage.content;
            }
        }

        // Formata a resposta no padrão que a Dyad/OpenAI espera
        const openAIResponse = {
            id: cozeResponse.data.conversation_id || 'chatcmpl-123',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'coze-bot',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: assistantResponse,
                },
                finish_reason: 'stop',
            }],
            usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            },
        };

        // Envia a resposta formatada de volta para a Dyad
        res.status(200).json(openAIResponse);

    } catch (error) {
        console.error('Erro ao chamar a API da Coze:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}
