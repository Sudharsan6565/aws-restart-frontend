import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch("/chat", "POST", { message: trimmed });
      const botMsg = { role: "bot", content: res.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      toast.error("Chat error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto space-y-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-blue-600 text-white"
                : "self-start bg-white dark:bg-neutral-800 text-black dark:text-white"
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}

        {loading && (
          <div className="self-start text-sm text-gray-500 animate-pulse">
            Bot is typing...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
