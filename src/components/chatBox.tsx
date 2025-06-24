import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

type Profile = {
  id: string;
  user_name: string;
  avatar_url?: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

interface ChatBoxProps {
  selectedUser: Profile;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ selectedUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

 const fetchMessages = async () => {
  if (!user || !selectedUser) return;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  const filtered = (data as Message[]).filter(
    (msg) =>
      (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
      (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
  );

  setMessages(filtered);
};


  useEffect(() => {
    if (selectedUser?.id) fetchMessages();
  }, [selectedUser]);

  const sendMessage = async () => {
  if (!input.trim() || !user || !selectedUser) return;

  const { error } = await supabase.from("messages").insert([
    {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: input.trim(),
    },
  ]);

  if (error) {
    console.error("Send error:", error);
  } else {
    setInput("");
    fetchMessages();
  }
};


  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-semibold text-white mb-2">
        Chat with {selectedUser?.user_name}
      </h2>
      <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-2 space-y-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm p-2 rounded max-w-xs break-words ${
              msg.sender_id === user?.id
                ? "bg-green-600 text-white self-end"
                : "bg-blue-600 text-white self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded p-2 bg-gray-700 text-white outline-none"
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 bg-blue-500 hover:bg-blue-600 rounded text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
};
