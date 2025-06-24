import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { MessageSquare } from "lucide-react";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_name, avatar_url");
      if (error) throw error;
      return data.filter((p) => p.id !== user?.id);
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", user?.id, activeUser?.id],
    enabled: !!user && !!activeUser,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeUser.id}),and(sender_id.eq.${activeUser.id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        sender_id: user?.id,
        receiver_id: activeUser.id,
        content: newMessage,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", user?.id, activeUser?.id]);
      setNewMessage("");
    },
  });

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 left-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700"
      >
        <MessageSquare size={24} />
      </button>

      {open && (
        <div className="fixed bottom-20 left-4 w-96 h-[28rem] bg-white rounded-xl shadow-xl flex border border-gray-200 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-300 bg-gray-100 overflow-y-auto">
            {profiles?.map((u) => (
              <div
                key={u.id}
                onClick={() => setActiveUser(u)}
                className={`p-3 flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-200 ${
                  activeUser?.id === u.id ? "bg-gray-300" : ""
                }`}
              >
                {u.avatar_url && (
                  <img src={u.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                )}
                <span>{u.user_name}</span>
              </div>
            ))}
          </div>

          {/* Chat Window */}
          <div className="flex flex-col w-2/3">
            <div className="flex-1 p-2 overflow-y-auto bg-white text-sm">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`my-1 p-2 rounded-md max-w-[75%] ${
                    msg.sender_id === user?.id ? "bg-indigo-100 ml-auto" : "bg-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMessage.trim()) sendMutation.mutate();
              }}
              className="p-2 border-t border-gray-200 flex"
            >
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-3 text-sm rounded-r-md hover:bg-indigo-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
