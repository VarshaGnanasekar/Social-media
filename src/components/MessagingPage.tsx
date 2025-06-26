import { useState, useEffect } from "react";
import { ChatBox } from "./chatBox";
import { MessageSquare, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";

interface Profile {
  id: string;
  user_name: string;
  avatar_url?: string;
  created_at?: string;
}

export default function MessagingPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);

    const { data: userData, error } = await supabase
      .from("profiles")
      .select("id, user_name, avatar_url")
      .neq("id", user?.id)
      .order("user_name", { ascending: true });

    if (error) {
      console.error("Error loading users:", error);
    } else {
      setUsers(userData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchUsers();
    }
  }, [user?.id]);

  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden max-w-xl mx-auto">
      {/* Show user list when no user is selected */}
      {!selectedUser ? (
        <div className="flex flex-col w-full h-full">
<h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        Get to know each others
      </h2>
          
          {/* Search bar */}
          <div className="relative px-3 py-2 border-b border-[#222]">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md bg-[#111] text-white border border-[#222] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* User list */}
          <div className="flex-1 overflow-y-auto bg-black">
            {loading ? (
              <div className="text-center text-gray-400 py-4">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No users found.</div>
            ) : (
              <ul className="divide-y divide-[#222]">
                {filteredUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between bg-[#0a0a0a] hover:bg-[#111] transition-colors px-4 py-3 cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="flex items-center space-x-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white text-sm font-semibold">
                          {u.user_name[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white font-medium">
                        {u.user_name}
                      </span>
                    </div>
                    <button className="p-2 rounded-full hover:bg-[#222] text-gray-400 hover:text-blue-400">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        /* Show chat box when a user is selected */
        <div className="flex flex-col h-full">
          {/* Mobile header with back button */}
          <div className="flex items-center p-3 bg-[#0a0a0a] border-b border-[#222] sticky top-0 z-10">
            <button 
              onClick={() => setSelectedUser(null)}
              className="mr-3 p-1 rounded-full hover:bg-[#222]"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center">
              {selectedUser.avatar_url ? (
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.user_name}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center mr-2">
                  <span className="text-white text-sm">
                    {selectedUser.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h2 className="text-white font-medium">{selectedUser.user_name}</h2>
            </div>
          </div>
          
          {/* Chat box - now without its own header */}
          <ChatBox selectedUser={selectedUser} />
        </div>
      )}
    </div>
  );
}