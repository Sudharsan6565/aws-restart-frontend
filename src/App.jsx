import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const { getToken, userId } = useAuth();
  const [token, setToken] = useState("");

  useEffect(() => {
    getToken({ template: "backend" }).then((t) => {
      console.log("✅ JWT Token:", t);
      setToken(t);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-2 text-xs bg-black text-white">Logged in as: {userId}</div>
      <ChatWindow />
      <Toaster position="top-right" />
    </div>
  );
}
