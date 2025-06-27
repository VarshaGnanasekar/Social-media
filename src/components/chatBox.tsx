import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Send, MessageSquare } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user || !selectedUser) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),` +
        `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    setMessages(data as Message[]);
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
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedUser, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !selectedUser || isSending) return;

    setIsSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert([{
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: input.trim(),
      }])
      .select();

    if (error) {
      console.error("Send error:", error);
    } else if (data?.[0]) {
      setInput("");
    }

    setMessages((prev) => [...prev, data?.[0]]);

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Messages container */}
      <div 
        className="flex-1 p-4 overflow-y-auto bg-black"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-12 w-12 mb-3" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Send your first message to {selectedUser.user_name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-xl ${msg.sender_id === user?.id
                    ? 'bg-blue-600 rounded-tr-none'
                    : 'bg-[#1a1a1a] rounded-tl-none'
                    }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs opacity-70 mt-1 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 bg-[#0a0a0a] border-t border-[#222] sticky bottom-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-xl p-3 bg-[#1a1a1a] text-white outline-none placeholder-gray-500 resize-none"
            placeholder="Type a message..."
            disabled={isSending}
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className={`p-3 rounded-xl ${!input.trim() || isSending
              ? 'bg-blue-500/50 cursor-not-allowed'
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