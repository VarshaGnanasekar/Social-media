import { useState } from "react";

import { ChatBox } from "./chatBox";
import { MessageSquare, ArrowLeft, Search} from 'lucide-react';
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
  const [showUserList, setShowUserList] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsersAndFollows = async () => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, user_name, avatar_url")
      .neq("id", user?.id)
      .order("user_name", { ascending: true });

    const { data: followData, error: followError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user?.id);

    if (userError || followError) {
      console.error("Error loading data:", userError || followError);
    } else {
      setUsers(userData || []);
      setFollowingIds(followData?.map((f) => f.following_id) || []);
    }

    setLoading(false);
  };

  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
      {/* Mobile header when chat is open */}
      {!showUserList && selectedUser && (
        <div className="md:hidden flex items-center p-3 bg-[#0a0a0a] border-b border-[#222]">
          <button 
            onClick={() => setShowUserList(true)}
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
      )}

      {/* Sidebar for User List - shown conditionally on mobile */}
      <div className={`${showUserList ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-b md:border-b-0 md:border-r border-[#222] h-full`}>
        <div className="p-3 border-b border-[#222] flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button className="md:hidden p-1 rounded-full hover:bg-[#222]">
            <Search className="h-5 w-5 text-white" />
          </button>
        </div>
        
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
                  onClick={() => {
                    setSelectedUser(u);
                    setShowUserList(false);
                  }}
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

      {/* Chat Area */}
      <div className={`${!showUserList ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full bg-black`}>
        {selectedUser ? (
          <ChatBox selectedUser={selectedUser} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-black">
            <div className="max-w-md">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h2 className="text-xl font-medium text-white mb-2">No conversation selected</h2>
              <p className="text-gray-400 mb-6">Select a user from the sidebar to start chatting</p>
              <button 
                onClick={() => setShowUserList(true)}
                className="md:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Browse Users
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}