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
}

export const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_name, avatar_url");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const filtered = data?.filter((u) => u.id !== user?.id) || [];
        setUsers(filtered);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [user]);

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-1 p-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
        Online Users
      </h3>
      {users.length === 0 && !loading ? (
        <p className="text-gray-400 text-sm px-2">No other users found</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
          >
            <div className="relative">
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
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.user_name}</p>
              <p className="text-xs text-gray-400 group-hover:text-gray-300">
                Online
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};