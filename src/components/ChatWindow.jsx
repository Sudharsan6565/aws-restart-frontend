import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const chatRef = useRef(null);
  const fileInputRef = useRef(null);

  const { getToken } = useAuth();
  const { user } = useUser();

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
      const token = await getToken({ template: "backend" });
      const res = await apiFetch("/chat", "POST", { message: userMsg }, token);
      setMessages((prev) => [...prev, { role: "bot", content: res.response }]);
    } catch (err) {
      toast.error("Chat failed: " + err.message);
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
    <div className="flex flex-col h-full max-h-[90vh] px-4 py-2">
      <div className="text-sm text-muted-foreground mb-2">
        Logged in as: <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto space-y-4 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-3 max-w-[80%] whitespace-pre-wrap ${
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
          className="flex-1 resize-none rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="bg-white dark:bg-neutral-800 border px-4 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
          >
            Send
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.docx,.csv,.png,.jpg,.jpeg"
        />
      </div>
    </div>
  );
}
