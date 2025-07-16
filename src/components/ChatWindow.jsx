import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setUploading(true);

    try {
      const token = await getToken({ template: "backend" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      toast.success("File uploaded & processed.");
      setMessages((prev) => [...prev, { role: "bot", content: json.bot_response }]);
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
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
                ? "self-end bg-[#0F172A] text-white"
                : "self-start bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
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

      {uploadedFile && (
        <div className="mt-2 text-sm text-muted-foreground">
          ✅ File attached: <span className="font-medium">{uploadedFile.name}</span>
        </div>
      )}

      <div className="mt-4 flex flex-col md:flex-row gap-2 w-full">
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
