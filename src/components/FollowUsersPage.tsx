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
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
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

    fetchUsersAndFollows();
  }, [user?.id]);

  const handleFollow = async (targetId: string) => {
    setIsFollowing(true);
    try {
      const { error } = await supabase.from("follows").insert({
        follower_id: user?.id,
        following_id: targetId,
      });

      if (!error) {
        setFollowingIds((prev) => [...prev, targetId]);
      } else {
        console.error("Error following user:", error);
      }
    } finally {
      setIsFollowing(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-semibold text-white mb-4 text-center">
        Discover & Follow Users
      </h1>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] text-white border border-[#333] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500">No users found.</div>
      ) : (
        <ul className="space-y-3">
          {filteredUsers.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-4 py-3 hover:border-blue-500 transition-all"
            >
              <div className="flex items-center space-x-3">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold">
                    {u.user_name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-white font-medium">
                  {u.user_name}
                </span>
              </div>

              {!followingIds.includes(u.id) ? (
                <button
                  onClick={() => handleFollow(u.id)}
                  disabled={isFollowing}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    isFollowing
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isFollowing ? "..." : "Follow"}
                </button>
              ) : (
                <span className="text-xs text-green-400">Following</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
