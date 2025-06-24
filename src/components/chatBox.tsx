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
  const [isSending, setIsSending] = useState(false);

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
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMessage = payload.new as Message;
        if ((newMessage.sender_id === selectedUser.id && newMessage.receiver_id === user?.id) ||
            (newMessage.sender_id === user?.id && newMessage.receiver_id === selectedUser.id)) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [selectedUser, user?.id]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !selectedUser || isSending) return;
    
    setIsSending(true);
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
    }
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-gray-700 p-4 flex items-center border-b border-gray-600">
        {selectedUser.avatar_url ? (
          <img
            src={selectedUser.avatar_url}
            alt={selectedUser.user_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-white text-lg">
              {selectedUser.user_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="ml-3">
          <h2 className="text-lg font-semibold text-white">
            {selectedUser.user_name}
          </h2>
          <p className="text-xs text-green-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
            Online
          </p>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-800 bg-opacity-50">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-700 text-white rounded-tl-none'
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 bg-gray-700 border-t border-gray-600">
        <div className="flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-l-lg p-3 bg-gray-600 text-white outline-none placeholder-gray-400"
            placeholder="Type a message..."
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className={`px-4 py-3 rounded-r-lg text-white font-medium ${!input.trim() || isSending
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-white mx-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};