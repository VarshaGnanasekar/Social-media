import React, { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

type Profile = {
  id: string;
  user_name: string;
  avatar_url?: string;
};

interface UserListProps {
  onSelectUser: (user: Profile) => void;
  searchQuery?: string;
}

export const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      let query = supabase
        .from("profiles")
        .select("id, user_name, avatar_url, created_at");

      if (searchQuery) {
        query = query.ilike('user_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const filtered = data?.filter((u) => u.id !== user?.id) || [];
        setUsers(filtered);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [user?.id, searchQuery]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-3 text-gray-400">Loading users...</p>
    </div>
  );

  return (
    <div className="h-full">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users list */}
      <div className="overflow-y-auto h-[calc(100%-56px)]">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>{searchQuery ? "No users found" : "No other users available"}</p>
            {!searchQuery && (
              <p className="text-sm mt-1">Invite others to join!</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => onSelectUser(user)}
                  className="w-full flex items-center p-3 hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.user_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white text-lg">
                          {user.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-gray-800"></span>
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user.user_name}</p>
                    <p className="text-xs text-gray-400 truncate">Active now</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};