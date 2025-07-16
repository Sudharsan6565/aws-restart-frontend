import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react"; // 👈 Clerk JWT hook

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const { getToken } = useAuth(); // ✅ Get Clerk token generator

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const token = await getToken({ template: "backend" }); // 👈 Get JWT dynamically
      const res = await apiFetch("/chat", "POST", { message: userMsg }, token);
      setMessages((prev) => [...prev, { role: "bot", content: res.response }]);
    } catch (err) {
      toast.error("Chat failed: " + err.message);
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
    <div className="flex flex-col h-full max-h-[90vh] px-4 py-2">
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto space-y-4 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-3 max-w-[80%] whitespace-pre-wrap ${
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
          className="flex-1 resize-none rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
