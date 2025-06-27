import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";




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
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  
const navigate = useNavigate();


const handleUnfollow = async (targetId: string) => {
  setLoadingUserId(targetId);
  try {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user?.id)
      .eq("following_id", targetId);

    if (!error) {
      setFollowingIds((prev) => prev.filter((id) => id !== targetId));
    } else {
      console.error("Error unfollowing user:", error);
    }
  } finally {
    setLoadingUserId(null);
  }
};


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
  setLoadingUserId(targetId);
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
    setLoadingUserId(null);
  }
};


  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
    <h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        Discover and Follow users
      </h2>
    <div className="max-w-xl mx-auto mt-10 px-4">
    

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] text-white border border-[#333] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
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
              <div className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate(`/user/${u.id}/posts`)}>
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
                  disabled={loadingUserId === u.id}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                     loadingUserId === u.id
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loadingUserId === u.id ? "..." : "Follow"}
                </button>
              ) : (
                <button
  onClick={() => handleUnfollow(u.id)}
  disabled={loadingUserId === u.id}
  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
    loadingUserId === u.id
      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
      : "bg-red-600 hover:bg-red-700 text-white"
  }`}
>
   {loadingUserId === u.id ? "..." : "Unfollow"}
</button>

              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
};
