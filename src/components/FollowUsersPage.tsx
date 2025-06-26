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
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-900 rounded-xl shadow-2xl text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Discover Users</h1>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="mt-2 text-lg">No users found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredUsers.map((u) => (
            <li
              key={u.id}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      {u.user_name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-lg">{u.user_name}</span>
                </div>

                {!followingIds.includes(u.id) ? (
                  <button
                    onClick={() => handleFollow(u.id)}
                    disabled={isFollowing}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      isFollowing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isFollowing ? "Processing..." : "Follow"}
                  </button>
                ) : (
                  <span className="px-5 py-2 rounded-full text-sm font-medium bg-green-600/20 text-green-400 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Following
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};