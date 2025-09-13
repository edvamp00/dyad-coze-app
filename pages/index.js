import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { role: "user", content: input }]);
    try {
      const { data } = await axios.post("/api/ask", { question: input });
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Erro ao responder. Tente novamente." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>dyad-coze-app Chat</h2>
      <div style={{ border: "1px solid #ccc", padding: 16, minHeight: 300, marginBottom: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 12, textAlign: msg.role === "user" ? "right" : "left" }}>
            <b>{msg.role === "user" ? "Você" : "Assistente"}:</b> {msg.content}
          </div>
        ))}
        {loading && <div>Respondendo...</div>}
      </div>
      <input
        type="text"
        value={input}
        placeholder="Digite sua mensagem..."
        onChange={e => setInput(e.target.value)}
        style={{ width: "80%", marginRight: 8 }}
        onKeyDown={e => e.key === "Enter" ? sendMessage() : null}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()}>
        Enviar
      </button>
    </div>
  );
}
