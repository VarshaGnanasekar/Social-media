import React, { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

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

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_name, avatar_url");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="text-white">Loading users...</p>;

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="cursor-pointer p-2 rounded hover:bg-gray-700 transition flex items-center space-x-2"
        >
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.user_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="text-white">{user.user_name}</span>
        </div>
      ))}
    </div>
  );
};
