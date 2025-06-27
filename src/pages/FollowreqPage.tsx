import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

type FollowRequest = {
  follower_id: string;
  status: string;
  follower_profile: {
    user_name: string;
    avatar_url?: string;
  };
};

type RawFollowRequest = {
  follower_id: string;
  status: string;
  profiles: {
    user_name: string;
    avatar_url?: string;
  } | null;
};


export const FollowRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("follows")
        .select(`
          follower_id,
          status,
          profiles:follower_id(user_name, avatar_url)
        `)
        .eq("following_id", user?.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching follow requests:", error);
        setRequests([]);
      } else {
        const formattedData: FollowRequest[] = (data as unknown as RawFollowRequest[]).map((item) => ({
  follower_id: item.follower_id,
  status: item.status,
  follower_profile: {
    user_name: item.profiles?.user_name || "Unknown",
    avatar_url: item.profiles?.avatar_url,
  },
}));

        setRequests(formattedData);
      }

      setLoading(false);
    };

    if (user?.id) fetchRequests();
  }, [user?.id]);

  const handleAction = async (followerId: string, accept: boolean) => {
    setRespondingId(followerId);
    try {
      if (accept) {
        const { error } = await supabase
          .from("follows")
          .update({ status: "approved" })
          .eq("follower_id", followerId)
          .eq("following_id", user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", followerId)
          .eq("following_id", user?.id);

        if (error) throw error;
      }

      setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
    } catch (err) {
      console.error("Error updating request:", err);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
        Follow Requests
      </h2>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-500">No follow requests.</div>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.follower_id}
              className="flex items-center justify-between bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-4 py-3"
            >
              <div className="flex items-center space-x-3">
                {req.follower_profile.avatar_url ? (
                  <img
                    src={req.follower_profile.avatar_url}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold">
                    {req.follower_profile.user_name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-white font-medium">
                  {req.follower_profile.user_name}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req.follower_id, true)}
                  disabled={respondingId === req.follower_id}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    respondingId === req.follower_id
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {respondingId === req.follower_id ? "..." : "Accept"}
                </button>
                <button
                  onClick={() => handleAction(req.follower_id, false)}
                  disabled={respondingId === req.follower_id}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    respondingId === req.follower_id
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {respondingId === req.follower_id ? "..." : "Reject"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};