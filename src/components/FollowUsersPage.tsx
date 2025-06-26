import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

type Profile = {
  id: string;
  user_name: string;
  avatar_url?: string;
};

export const FollowUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsersAndFollows = async () => {
      setLoading(true);

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, user_name, avatar_url")
        .neq("id", user?.id);

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

    fetchUsersAndFollows();
  }, [user?.id]);

  const handleFollow = async (targetId: string) => {
    const { error } = await supabase.from("follows").insert({
      follower_id: user?.id,
      following_id: targetId,
    });

    if (!error) {
      setFollowingIds((prev) => [...prev, targetId]);
    } else {
      console.error("Error following user:", error);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-xl font-bold mb-4">Discover Users to Follow</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700"
      />

      {loading ? (
        <div className="text-center text-gray-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500">No users found.</div>
      ) : (
        <ul className="divide-y divide-gray-700">
          {filteredUsers.map((u) => (
            <li key={u.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                    {u.user_name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-medium">{u.user_name}</span>
              </div>

              {!followingIds.includes(u.id) ? (
                <button
                  onClick={() => handleFollow(u.id)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm"
                >
                  Follow
                </button>
              ) : (
                <span className="text-sm text-green-400">Following</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
