import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não suportado" });
  }

  const { question } = req.body;
  const botId = process.env.COZE_BOT_ID;
  const apiKey = process.env.COZE_API_KEY;

  if (!botId || !apiKey) {
    return res.status(500).json({ error: "Configuração do Coze ausente." });
  }

  try {
    const response = await axios.post(
      "https://api.coze.com/open_api/v2/chat",
      {
        bot_id: botId,
        user: "github-user",
        query: question,
        stream: false,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data?.messages?.[0]?.content || "Sem resposta do Coze.";
    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({ error: "Erro ao conectar com Coze." });
  }
}
