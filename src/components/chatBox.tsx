import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';

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
  const [isScrolled, setIsScrolled] = useState(false);

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
    
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, payload => {
        const newMessage = payload.new as Message;
        if ((newMessage.sender_id === selectedUser.id && newMessage.receiver_id === user?.id) ||
            (newMessage.sender_id === user?.id && newMessage.receiver_id === selectedUser.id)) {
          setMessages(prev => [...prev, newMessage]);
          if (!isScrolled) {
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [selectedUser, user?.id]);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      setIsScrolled(false);
    }
  };

  const handleScroll = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      setIsScrolled(scrollHeight - (scrollTop + clientHeight) > 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !selectedUser || isSending) return;

    setIsSending(true);

    const newMessage = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("messages").insert([
      {
        ...newMessage,
      },
    ]).select();

    if (error) {
      console.error("Send error:", error);
    } else if (data && data.length > 0) {
      setMessages(prev => [...prev, data[0]]);
      setInput("");
      setTimeout(() => {
        scrollToBottom();
      }, 50);
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
    <div className="flex flex-col h-full bg-black">
      {/* Chat header */}
      <div className="bg-[#0a0a0a] p-3 flex items-center border-b border-[#222] sticky top-0 z-10">
        <div className="flex items-center">
          {selectedUser.avatar_url ? (
            <img
              src={selectedUser.avatar_url}
              alt={selectedUser.user_name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center">
              <span className="text-white text-lg">
                {selectedUser.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-3">
            <h2 className="text-md font-semibold text-white">
              {selectedUser.user_name}
            </h2>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div 
        id="messages-container"
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto bg-black"
      >
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="h-12 w-12 mb-3" />
              <p>No messages yet</p>
              <p className="text-sm mt-1">Send your first message to {selectedUser.user_name}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#111] text-white rounded-tl-none'
                    }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
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
      <div className="p-3 bg-[#0a0a0a] border-t border-[#222] sticky bottom-0">
        <div className="flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-lg p-3 bg-[#111] text-white outline-none placeholder-gray-400 resize-none"
            placeholder="Type a message..."
            disabled={isSending}
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className={`ml-2 p-2 rounded-lg text-white ${!input.trim() || isSending
              ? 'bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};